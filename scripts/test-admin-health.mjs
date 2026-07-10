import assert from 'assert';
import { runHealthCheck } from './admin-health-core.mjs';

const MOCK_ORIGIN = 'http://localhost';

async function runTest(name, mockFetch, testFn) {
    try {
        const results = await runHealthCheck({
            fetchFn: mockFetch,
            baseOrigin: MOCK_ORIGIN,
            timeoutMs: 100, // short timeout for testing
            maxConcurrency: 4
        });
        testFn(results);
        console.log(`✅ Test "${name}" passed.`);
    } catch (err) {
        console.error(`❌ Test "${name}" failed:`, err);
        process.exit(1);
    }
}

console.log('🧪 Starting Gallery Health Check Core Test Suite...\n');

// 1. Valid manifest and accessible apps (PASS)
await runTest(
    'Valid manifest and available apps',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true, created: '2026-07-10' }
                    ]
                })
            };
        }
        if (url.includes('dioda/index.html')) {
            return { ok: true, text: async () => '<!doctype html><html></html>' };
        }
        // system files
        return { ok: true, text: async () => 'some text' };
    },
    (res) => {
        assert.strictEqual(res.manifestStatus.success, true);
        assert.strictEqual(res.apps.length, 1);
        assert.strictEqual(res.apps[0].overallStatus, 'PASS');
        assert.strictEqual(res.summary.errors, 0);
        assert.strictEqual(res.summary.warnings, 0);
    }
);

// 2. Manifest returns 404 (H001)
await runTest(
    'Manifest returns 404',
    async (url) => {
        if (url.includes('manifest.json')) {
            return { ok: false, status: 404 };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.manifestStatus.success, false);
        assert.strictEqual(res.manifestStatus.code, 'H001');
        assert.strictEqual(res.summary.errors, 1); // manifest error
    }
);

// 3. Manifest returns invalid JSON (H002)
await runTest(
    'Manifest contains invalid JSON',
    async (url) => {
        if (url.includes('manifest.json')) {
            return { ok: true, text: async () => '{invalid json' };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.manifestStatus.success, false);
        assert.strictEqual(res.manifestStatus.code, 'H002');
    }
);

// 4. Manifest structure invalid: array instead of object (H003)
await runTest(
    'Manifest root is array instead of object',
    async (url) => {
        if (url.includes('manifest.json')) {
            return { ok: true, text: async () => '[]' };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.manifestStatus.success, false);
        assert.strictEqual(res.manifestStatus.code, 'H003');
    }
);

// 5. Manifest missing exercises field (H003)
await runTest(
    'Manifest missing exercises array',
    async (url) => {
        if (url.includes('manifest.json')) {
            return { ok: true, text: async () => JSON.stringify({ wrongKey: [] }) };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.manifestStatus.success, false);
        assert.strictEqual(res.manifestStatus.code, 'H003');
    }
);

// 6. Manifest exercises is empty (H003)
await runTest(
    'Manifest exercises array is empty',
    async (url) => {
        if (url.includes('manifest.json')) {
            return { ok: true, text: async () => JSON.stringify({ exercises: [] }) };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.manifestStatus.success, false);
        assert.strictEqual(res.manifestStatus.code, 'H003');
    }
);

// 7. Exercise missing mandatory fields (H004)
await runTest(
    'Exercise missing mandatory description and name',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', folder: 'dioda', isBuilt: true } // missing name, description, icon
                    ]
                })
            };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.manifestStatus.success, true);
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H004');
        assert.ok(res.apps[0].message.includes('Chybějící nebo neplatný název'));
    }
);

// 8. Exercise folder/id contains invalid characters (H004)
await runTest(
    'Exercise folder contains invalid characters',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'Dioda App!', isBuilt: true }
                    ]
                })
            };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H004');
    }
);

// 9. Exercise duplicate id or folder (H005)
await runTest(
    'Exercises contain duplicate folders',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'd1', name: 'Dioda 1', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true },
                        { id: 'd2', name: 'Dioda 2', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true }
                    ]
                })
            };
        }
        return { ok: true, text: async () => '<!doctype html><html></html>' };
    },
    (res) => {
        assert.strictEqual(res.apps[1].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[1].code, 'H005');
        assert.ok(res.apps[1].message.includes('Duplicitní složka'));
    }
);

// 10. Application index.html 404 (H006)
await runTest(
    'Application index.html returns 404',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true }
                    ]
                })
            };
        }
        if (url.includes('dioda/index.html')) {
            return { ok: false, status: 404 };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H006');
    }
);

// 11. Application index.html empty (H007)
await runTest(
    'Application index.html is empty',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true }
                    ]
                })
            };
        }
        if (url.includes('dioda/index.html')) {
            return { ok: true, text: async () => '   ' }; // whitespace only
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H007');
        assert.ok(res.apps[0].message.includes('prázdný'));
    }
);

// 12. Application index.html invalid HTML (H007)
await runTest(
    'Application index.html lacks HTML doctype/tag',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true }
                    ]
                })
            };
        }
        if (url.includes('dioda/index.html')) {
            return { ok: true, text: async () => 'just simple text' };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H007');
        assert.ok(res.apps[0].message.includes('neobsahuje platný HTML dokument'));
    }
);

// 13. Timeout of application request (H008)
await runTest(
    'Application request triggers timeout',
    async (url, options) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true }
                    ]
                })
            };
        }
        if (url.includes('dioda/index.html')) {
            const signal = options?.signal;
            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    resolve();
                }, 150);
                if (signal) {
                    signal.addEventListener('abort', () => {
                        clearTimeout(timeoutId);
                        const err = new Error('The user aborted a request.');
                        err.name = 'AbortError';
                        reject(err);
                    });
                }
            });
            return { ok: true, text: async () => '<!doctype html><html></html>' };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H008');
    }
);

// 14. play.html wrapper is 404 (H009)
await runTest(
    'play.html wrapper is unavailable',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true }
                    ]
                })
            };
        }
        if (url.includes('dioda/index.html')) {
            return { ok: true, text: async () => '<!doctype html><html></html>' };
        }
        if (url.includes('play.html')) {
            return { ok: false, status: 404 };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.summary.errors, 1); // H009 error
        const playRes = res.systemFiles.find(x => x.name === 'play.html');
        assert.strictEqual(playRes.status, 'CHYBA');
        assert.strictEqual(playRes.code, 'H009');
    }
);

// 15. Optional created field warning (HW01)
await runTest(
    'Exercise created field has invalid format',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true, created: 'invalid-date' }
                    ]
                })
            };
        }
        if (url.includes('dioda/index.html')) {
            return { ok: true, text: async () => '<!doctype html><html></html>' };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'VAROVÁNÍ');
        assert.strictEqual(res.apps[0].code, 'HW01');
        assert.strictEqual(res.summary.warnings, 1);
    }
);

// 16. robots.txt (HW02) and sitemap.xml (HW03) warning
await runTest(
    'robots.txt and sitemap.xml are 404',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true, created: '2026-07-10' }
                    ]
                })
            };
        }
        if (url.includes('dioda/index.html')) {
            return { ok: true, text: async () => '<!doctype html><html></html>' };
        }
        if (url.includes('robots.txt') || url.includes('sitemap.xml')) {
            return { ok: false, status: 404 };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.summary.errors, 0);
        assert.strictEqual(res.summary.warnings, 2); // HW02 + HW03
        const rob = res.systemFiles.find(x => x.name === 'robots.txt');
        const sit = res.systemFiles.find(x => x.name === 'sitemap.xml');
        assert.strictEqual(rob.status, 'VAROVÁNÍ');
        assert.strictEqual(rob.code, 'HW02');
        assert.strictEqual(sit.status, 'VAROVÁNÍ');
        assert.strictEqual(sit.code, 'HW03');
    }
);

// 17. Concurrency limitation (max 4 parallel)
await (async () => {
    let activeFetches = 0;
    let maxParallel = 0;

    await runHealthCheck({
        fetchFn: async (url) => {
            if (url.includes('manifest.json')) {
                return {
                    ok: true,
                    text: async () => JSON.stringify({
                        exercises: Array.from({ length: 10 }, (_, i) => ({
                            id: `app${i}`,
                            name: `App ${i}`,
                            description: 'desc',
                            icon: '⚡',
                            folder: `app${i}`,
                            isBuilt: true
                        }))
                    })
                };
            }
            if (url.includes('/index.html')) {
                activeFetches++;
                maxParallel = Math.max(maxParallel, activeFetches);
                await new Promise(resolve => setTimeout(resolve, 30));
                activeFetches--;
                return { ok: true, text: async () => '<!doctype html><html></html>' };
            }
            return { ok: true, text: async () => 'ok' };
        },
        baseOrigin: MOCK_ORIGIN,
        timeoutMs: 500,
        maxConcurrency: 4
    });

    assert.ok(maxParallel <= 4, `Expected max parallel fetches <= 4, got ${maxParallel}`);
    console.log('✅ Test "Concurrency limit" passed.');
})();

// 18. Do not fetch index.html for app with invalid folder slug
await (async () => {
    let fetchedDioda = false;
    let fetchedInvalid = false;

    await runHealthCheck({
        fetchFn: async (url) => {
            if (url.includes('manifest.json')) {
                return {
                    ok: true,
                    text: async () => JSON.stringify({
                        exercises: [
                            { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true },
                            { id: 'bad', name: 'Bad App', description: 'desc', icon: '⚡', folder: 'bad folder!/../../', isBuilt: true }
                        ]
                    })
                };
            }
            if (url.includes('dioda/index.html')) {
                fetchedDioda = true;
                return { ok: true, text: async () => '<!doctype html><html></html>' };
            }
            if (url.includes('bad')) {
                fetchedInvalid = true;
                return { ok: true, text: async () => 'bad' };
            }
            return { ok: true, text: async () => 'ok' };
        },
        baseOrigin: MOCK_ORIGIN,
        timeoutMs: 500,
        maxConcurrency: 4
    });

    assert.strictEqual(fetchedDioda, true);
    assert.strictEqual(fetchedInvalid, false);
    console.log('✅ Test "Skip fetch for invalid folder slug" passed.');
})();

// 19. Invalid id format (H004)
await runTest(
    'Exercise id contains uppercase/special chars',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'Dioda!App', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true }
                    ]
                })
            };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H004');
        assert.ok(res.apps[0].message.includes('nepovolené znaky'));
    }
);

// 20. Duplicate id (H005)
await runTest(
    'Exercises contain duplicate IDs',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda 1', description: 'desc', icon: '⚡', folder: 'dioda-1', isBuilt: true },
                        { id: 'dioda', name: 'Dioda 2', description: 'desc', icon: '⚡', folder: 'dioda-2', isBuilt: true }
                    ]
                })
            };
        }
        return { ok: true, text: async () => '<!doctype html><html></html>' };
    },
    (res) => {
        assert.strictEqual(res.apps[1].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[1].code, 'H005');
        assert.ok(res.apps[1].message.includes('Duplicitní ID'));
    }
);

// 21. isBuilt has wrong type (string instead of boolean) (H004)
await runTest(
    'Exercise isBuilt is string instead of boolean',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: 'true' }
                    ]
                })
            };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H004');
        assert.ok(res.apps[0].message.includes('isBuilt'));
    }
);

// 22. isBuilt is boolean false (H004)
await runTest(
    'Exercise isBuilt is false',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: false }
                    ]
                })
            };
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H004');
        assert.ok(res.apps[0].message.includes('isBuilt'));
    }
);

// 23. Network error (TypeError) when fetching app index.html (H006)
await runTest(
    'Network TypeError when fetching app',
    async (url) => {
        if (url.includes('manifest.json')) {
            return {
                ok: true,
                text: async () => JSON.stringify({
                    exercises: [
                        { id: 'dioda', name: 'Dioda', description: 'desc', icon: '⚡', folder: 'dioda', isBuilt: true }
                    ]
                })
            };
        }
        if (url.includes('dioda/index.html')) {
            throw new TypeError('Failed to fetch');
        }
        return { ok: true, text: async () => 'ok' };
    },
    (res) => {
        assert.strictEqual(res.apps[0].overallStatus, 'CHYBA');
        assert.strictEqual(res.apps[0].code, 'H006');
        assert.ok(res.apps[0].message.includes('Failed to fetch'));
    }
);

// 24. Continuation after one app failure – second app still checked
await (async () => {
    const results = await runHealthCheck({
        fetchFn: async (url) => {
            if (url.includes('manifest.json')) {
                return {
                    ok: true,
                    text: async () => JSON.stringify({
                        exercises: [
                            { id: 'app-a', name: 'App A', description: 'desc', icon: '⚡', folder: 'app-a', isBuilt: true, created: '2026-01-01' },
                            { id: 'app-b', name: 'App B', description: 'desc', icon: '⚡', folder: 'app-b', isBuilt: true, created: '2026-01-01' }
                        ]
                    })
                };
            }
            if (url.includes('app-a/index.html')) {
                return { ok: false, status: 404 };
            }
            if (url.includes('app-b/index.html')) {
                return { ok: true, text: async () => '<!doctype html><html></html>' };
            }
            return { ok: true, text: async () => 'ok' };
        },
        baseOrigin: MOCK_ORIGIN,
        timeoutMs: 500,
        maxConcurrency: 4
    });

    assert.strictEqual(results.apps[0].overallStatus, 'CHYBA');
    assert.strictEqual(results.apps[0].code, 'H006');
    assert.strictEqual(results.apps[1].overallStatus, 'PASS');
    assert.strictEqual(results.apps[1].indexHtmlStatus, 'PASS');
    assert.strictEqual(results.summary.availableApps, 1);
    console.log('✅ Test "Continuation after one app failure" passed.');
})();

// 25. Invalid manifest item does not trigger any fetch
await (async () => {
    const fetchedUrls = [];
    await runHealthCheck({
        fetchFn: async (url) => {
            fetchedUrls.push(url);
            if (url.includes('manifest.json')) {
                return {
                    ok: true,
                    text: async () => JSON.stringify({
                        exercises: [
                            { id: 'good', name: 'Good', description: 'desc', icon: '⚡', folder: 'good', isBuilt: true },
                            { id: '', name: '', description: '', icon: '', folder: '', isBuilt: false }
                        ]
                    })
                };
            }
            if (url.includes('good/index.html')) {
                return { ok: true, text: async () => '<!doctype html><html></html>' };
            }
            return { ok: true, text: async () => 'ok' };
        },
        baseOrigin: MOCK_ORIGIN,
        timeoutMs: 500,
        maxConcurrency: 4
    });

    // The only index.html fetch should be for 'good'
    const indexFetches = fetchedUrls.filter(u => u.includes('/index.html'));
    assert.strictEqual(indexFetches.length, 1);
    assert.ok(indexFetches[0].includes('good/index.html'));
    console.log('✅ Test "Invalid manifest item triggers no fetch" passed.');
})();

// 26. System files checked even when manifest fails
await (async () => {
    const fetchedUrls = [];
    const results = await runHealthCheck({
        fetchFn: async (url) => {
            fetchedUrls.push(url);
            if (url.includes('manifest.json')) {
                return { ok: false, status: 500 };
            }
            return { ok: true, text: async () => 'ok' };
        },
        baseOrigin: MOCK_ORIGIN,
        timeoutMs: 500,
        maxConcurrency: 4
    });

    assert.strictEqual(results.manifestStatus.success, false);
    assert.strictEqual(results.manifestStatus.code, 'H001');
    // System files should still have been checked
    assert.strictEqual(results.systemFiles.length, 3);
    const playResult = results.systemFiles.find(s => s.name === 'play.html');
    assert.strictEqual(playResult.status, 'PASS');
    // Verify that play.html, robots.txt, sitemap.xml were actually fetched
    assert.ok(fetchedUrls.some(u => u.includes('play.html')));
    assert.ok(fetchedUrls.some(u => u.includes('robots.txt')));
    assert.ok(fetchedUrls.some(u => u.includes('sitemap.xml')));
    console.log('✅ Test "System files checked when manifest fails" passed.');
})();

console.log('\n=========================================');
console.log('✅ ALL HEALTH CHECK CORE TESTS PASSED!');
console.log('=========================================');
