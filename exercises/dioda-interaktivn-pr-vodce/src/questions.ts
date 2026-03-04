export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const ALL_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Co je to PN přechod?",
    options: [
      "Rozhraní mezi dvěma kovy",
      "Rozhraní mezi polovodičem typu P a polovodičem typu N",
      "Součástka složená ze tří vrstev polovodiče",
      "Izolační vrstva v kondenzátoru"
    ],
    correctIndex: 1,
    explanation: "PN přechod vzniká na rozhraní polovodičů s různým typem vodivosti (P a N)."
  },
  {
    id: 2,
    text: "Který nosič náboje převažuje v polovodiči typu N?",
    options: ["Díry", "Elektrony", "Protony", "Neutrony"],
    correctIndex: 1,
    explanation: "V polovodiči typu N (Negative) jsou majoritními nosiči náboje volné elektrony."
  },
  {
    id: 3,
    text: "Který nosič náboje převažuje v polovodiči typu P?",
    options: ["Elektrony", "Díry", "Ionty", "Fotony"],
    correctIndex: 1,
    explanation: "V polovodiči typu P (Positive) jsou majoritními nosiči náboje 'díry' (deficit elektronů)."
  },
  {
    id: 4,
    text: "Jak se chová ideální dioda v propustném směru?",
    options: [
      "Jako rozpojený spínač",
      "Jako sepnutý spínač (nulový odpor)",
      "Jako rezistor s vysokým odporem",
      "Jako zdroj napětí"
    ],
    correctIndex: 1,
    explanation: "Ideální dioda v propustném směru neklade žádný odpor (chová se jako zkrat)."
  },
  {
    id: 5,
    text: "Jak se chová ideální dioda v závěrném směru?",
    options: [
      "Jako sepnutý spínač",
      "Jako rozpojený spínač (nekonečný odpor)",
      "Jako kondenzátor",
      "Jako cívka"
    ],
    correctIndex: 1,
    explanation: "Ideální dioda v závěrném směru nepropouští žádný proud (chová se jako rozpojený obvod)."
  },
  {
    id: 6,
    text: "Jaké je přibližné prahové napětí křemíkové (Si) diody?",
    options: ["0.1 V", "0.3 V", "0.7 V", "1.2 V"],
    correctIndex: 2,
    explanation: "Křemíkové diody mají typické prahové napětí kolem 0.6 až 0.7 V."
  },
  {
    id: 7,
    text: "Jaké je přibližné prahové napětí germaniové (Ge) diody?",
    options: ["0.3 V", "0.7 V", "1.5 V", "2.0 V"],
    correctIndex: 0,
    explanation: "Germaniové diody mají nižší prahové napětí, obvykle kolem 0.2 až 0.3 V."
  },
  {
    id: 8,
    text: "K čemu slouží Zenerova dioda?",
    options: [
      "K usměrňování vysokých proudů",
      "Ke stabilizaci napětí",
      "K detekci světla",
      "K zesilování signálu"
    ],
    correctIndex: 1,
    explanation: "Zenerova dioda se využívá především ke stabilizaci napětí díky své schopnosti pracovat v oblasti průrazu."
  },
  {
    id: 9,
    text: "V jakém směru se zapojuje Zenerova dioda pro stabilizaci?",
    options: ["V propustném směru", "V závěrném směru", "Nezáleží na směru", "Střídavě"],
    correctIndex: 1,
    explanation: "Pro stabilizaci napětí se Zenerova dioda zapojuje v závěrném směru, kde využívá Zenerův nebo lavinový průraz."
  },
  {
    id: 10,
    text: "Co znamená zkratka LED?",
    options: [
      "Light Electronic Device",
      "Light Emitting Diode",
      "Low Energy Diode",
      "Laser Emitting Device"
    ],
    correctIndex: 1,
    explanation: "LED je zkratka pro Light Emitting Diode (elektroluminiscenční dioda)."
  },
  {
    id: 11,
    text: "Která dioda má nejnižší úbytek napětí v propustném směru?",
    options: ["Standardní Si dioda", "Zenerova dioda", "Schottkyho dioda", "LED"],
    correctIndex: 2,
    explanation: "Schottkyho dioda má velmi nízký úbytek napětí (cca 0.2 - 0.4 V) a je velmi rychlá."
  },
  {
    id: 12,
    text: "Jak se nazývá elektroda diody připojená k P-polovodiči?",
    options: ["Katoda", "Anoda", "Báze", "Kolektor"],
    correctIndex: 1,
    explanation: "Anoda je kladná elektroda diody spojená s vrstvou typu P."
  },
  {
    id: 13,
    text: "Jak se nazývá elektroda diody připojená k N-polovodiči?",
    options: ["Anoda", "Katoda", "Emitor", "Hradlo"],
    correctIndex: 1,
    explanation: "Katoda je záporná elektroda diody spojená s vrstvou typu N."
  },
  {
    id: 14,
    text: "Co se stane s hradlovou vrstvou PN přechodu v závěrném směru?",
    options: ["Zúží se", "Rozšíří se", "Zůstane stejná", "Zanikne"],
    correctIndex: 1,
    explanation: "V závěrném směru vnější pole odtahuje nosiče od přechodu, čímž se hradlová (ochuzená) vrstva rozšiřuje."
  },
  {
    id: 15,
    text: "K čemu slouží usměrňovač?",
    options: [
      "K přeměně DC napětí na AC",
      "K přeměně AC napětí na DC",
      "Ke zvýšení frekvence",
      "K filtraci šumu"
    ],
    correctIndex: 1,
    explanation: "Usměrňovač slouží k přeměně střídavého proudu (AC) na stejnosměrný (DC)."
  },
  {
    id: 16,
    text: "Kolik diod obsahuje jednocestný usměrňovač?",
    options: ["1", "2", "4", "6"],
    correctIndex: 0,
    explanation: "Jednocestný usměrňovač využívá pouze jednu diodu k propuštění jedné půlvlny."
  },
  {
    id: 17,
    text: "Kolik diod obsahuje mostíkový (Graetzův) usměrňovač?",
    options: ["1", "2", "4", "8"],
    correctIndex: 2,
    explanation: "Mostíkový usměrňovač využívá čtyři diody zapojené do můstku pro dvoucestné usměrnění."
  },
  {
    id: 18,
    text: "Jaká je hlavní výhoda dvoucestného usměrňovače oproti jednocestnému?",
    options: [
      "Je levnější",
      "Využívá obě půlvlny střídavého napětí",
      "Nepotřebuje transformátor",
      "Má nižší úbytek napětí"
    ],
    correctIndex: 1,
    explanation: "Dvoucestný usměrňovač využívá kladnou i zápornou půlvlnu, což vede k efektivnějšímu napájení a snazší filtraci."
  },
  {
    id: 19,
    text: "Jaká součástka se nejčastěji používá k vyhlazení (filtraci) usměrněného napětí?",
    options: ["Rezistor", "Cívka", "Kondenzátor", "Tranzistor"],
    correctIndex: 2,
    explanation: "Kondenzátor zapojený paralelně k zátěži funguje jako zásobník energie a vyhlazuje zvlnění napětí."
  },
  {
    id: 20,
    text: "Co se stane se zvlněním napětí, pokud zvýšíme kapacitu filtračního kondenzátoru?",
    options: ["Zvětší se", "Zmenší se", "Nezmění se", "Napětí zanikne"],
    correctIndex: 1,
    explanation: "Vyšší kapacita lépe vykrývá poklesy napětí mezi půlvlnami, čímž se zvlnění (ripple) zmenšuje."
  },
  {
    id: 21,
    text: "Jak reaguje fotodioda na světlo?",
    options: [
      "Mění svou barvu",
      "Generuje elektrický proud nebo mění vodivost",
      "Zvyšuje svůj vnitřní odpor",
      "Vybuchne"
    ],
    correctIndex: 1,
    explanation: "Dopadající fotony uvolňují v PN přechodu nosiče náboje, což vede ke vzniku proudu."
  },
  {
    id: 22,
    text: "Co je to Varikap?",
    options: [
      "Dioda pro stabilizaci proudu",
      "Kapacitní dioda řízená napětím",
      "Dioda pro vysoké frekvence",
      "Dioda emitující rentgenové záření"
    ],
    correctIndex: 1,
    explanation: "Varikap využívá závislosti kapacity PN přechodu na závěrném napětí."
  },
  {
    id: 23,
    text: "Který materiál je základem většiny moderních diod?",
    options: ["Měď", "Křemík", "Zlato", "Hliník"],
    correctIndex: 1,
    explanation: "Křemík (Silicon) je nejrozšířenějším polovodičovým materiálem."
  },
  {
    id: 24,
    text: "Co je to lavinový průraz?",
    options: [
      "Mechanické poškození diody",
      "Prudký nárůst proudu v závěrném směru při vysokém napětí",
      "Změna barvy LED",
      "Zkrat v kondenzátoru"
    ],
    correctIndex: 1,
    explanation: "Při dosažení kritického závěrného napětí získají nosiče takovou energii, že nárazem uvolňují další nosiče (lavinový efekt)."
  },
  {
    id: 25,
    text: "Jak se nazývá proces přidávání příměsí do čistého polovodiče?",
    options: ["Legování", "Dopování", "Kalení", "Oxidace"],
    correctIndex: 1,
    explanation: "Dopování (Doping) je záměrné vkládání atomů jiných prvků do krystalové mřížky polovodiče pro změnu jeho vodivosti."
  },
  {
    id: 26,
    text: "Jaký prvek se používá k vytvoření polovodiče typu N (pětimocný)?",
    options: ["Bór", "Hliník", "Fosfor", "Indium"],
    correctIndex: 2,
    explanation: "Prvky z V. skupiny (např. Fosfor, Arsen) mají 5 valenčních elektronů, jeden přebývá -> typ N."
  },
  {
    id: 27,
    text: "Jaký prvek se používá k vytvoření polovodiče typu P (třímocný)?",
    options: ["Fosfor", "Antimon", "Bór", "Arsen"],
    correctIndex: 2,
    explanation: "Prvky ze III. skupiny (např. Bór, Hliník) mají 3 valenční elektrony, jeden chybí -> typ P (díra)."
  },
  {
    id: 28,
    text: "Co je to difuzní proud na PN přechodu?",
    options: [
      "Proud způsobený vnějším zdrojem",
      "Pohyb nosičů způsobený rozdílem koncentrací",
      "Proud protékající izolantem",
      "Tepelný šum"
    ],
    correctIndex: 1,
    explanation: "Nosiče mají tendenci přecházet z míst s vyšší koncentrací do míst s nižší koncentrací."
  },
  {
    id: 29,
    text: "Jaká je funkce usměrňovacího můstku v napájecím zdroji?",
    options: [
      "Snížit napětí",
      "Změnit AC na pulzující DC",
      "Uložit energii",
      "Ochránit před bleskem"
    ],
    correctIndex: 1,
    explanation: "Můstek překlápí záporné půlvlny na kladné, čímž vytváří stejnosměrný, i když pulzující průběh."
  },
  {
    id: 30,
    text: "Proč se v propustném směru diody objevuje úbytek napětí?",
    options: [
      "Kvůli odporu přívodních drátů",
      "Kvůli nutnosti překonat potenciálovou bariéru PN přechodu",
      "Kvůli magnetickému poli",
      "Dioda napětí vyrábí"
    ],
    correctIndex: 1,
    explanation: "Vnější napětí musí být dostatečně velké, aby překonalo vnitřní elektrické pole hradlové vrstvy."
  },
  {
    id: 31,
    text: "Co se stane, pokud zapojíme LED diodu opačně (v závěrném směru)?",
    options: [
      "Bude svítit jinou barvou",
      "Nebude svítit a nepoteče jí proud",
      "Bude svítit jasněji",
      "Změní se na fotodiodu"
    ],
    correctIndex: 1,
    explanation: "V závěrném směru dioda nevede, takže LED nebude emitovat světlo."
  },
  {
    id: 32,
    text: "Jaký je hlavní rozdíl mezi usměrňovací a Zenerovou diodou?",
    options: [
      "Usměrňovací je větší",
      "Zenerova může bezpečně pracovat v oblasti průrazu",
      "Usměrňovací svítí",
      "Zenerova nemá PN přechod"
    ],
    correctIndex: 1,
    explanation: "Zenerovy diody jsou konstruovány tak, aby vydržely dlouhodobý provoz v závěrném průrazu bez zničení."
  },
  {
    id: 33,
    text: "Co určuje barvu světla LED diody?",
    options: [
      "Barva plastového pouzdra",
      "Velikost protékajícího proudu",
      "Materiál polovodiče a šířka zakázaného pásu",
      "Tvar anody"
    ],
    correctIndex: 2,
    explanation: "Energie emitovaného fotonu (a tedy barva) závisí na rozdílu energií hladin, mezi kterými elektron přeskakuje."
  },
  {
    id: 34,
    text: "K čemu slouží rezistor zapojený do série s LED diodou?",
    options: [
      "Ke zvýšení jasu",
      "K omezení proudu, aby se dioda nespálila",
      "K filtraci napětí",
      "K měření teploty"
    ],
    correctIndex: 1,
    explanation: "Dioda má v propustném směru velmi malý odpor, bez rezistoru by proud mohl překročit bezpečnou mez."
  },
  {
    id: 35,
    text: "Jaká je frekvence pulzů na výstupu dvoucestného usměrňovače při vstupní frekvenci 50 Hz?",
    options: ["25 Hz", "50 Hz", "100 Hz", "200 Hz"],
    correctIndex: 2,
    explanation: "Protože se využívají obě půlvlny, počet 'kopců' za sekundu se zdvojnásobí."
  },
  {
    id: 36,
    text: "Co je to 'Ripple voltage' (zvlnění)?",
    options: [
      "Maximální napětí zdroje",
      "Zbytková střídavá složka na výstupu DC zdroje",
      "Napětí, které diodu zničí",
      "Šum v rádiu"
    ],
    correctIndex: 1,
    explanation: "Je to kolísání napětí na filtračním kondenzátoru způsobené jeho vybíjením do zátěže."
  },
  {
    id: 37,
    text: "Která součástka v napájecím zdroji zajišťuje oddělení od sítě a snížení napětí?",
    options: ["Usměrňovač", "Transformátor", "Kondenzátor", "Pojistka"],
    correctIndex: 1,
    explanation: "Transformátor mění velikost střídavého napětí a zajišťuje galvanické oddělení."
  },
  {
    id: 38,
    text: "V jakém režimu pracuje fotodioda v solárním článku?",
    options: ["Hradlový (fotovoltaický) režim", "Odporový režim", "Zkratový režim", "Zenerův režim"],
    correctIndex: 0,
    explanation: "V tomto režimu fotodioda přímo přeměňuje světlo na elektrickou energii bez vnějšího zdroje."
  },
  {
    id: 39,
    text: "Co se stane s odporem termistoru typu NTC při zvýšení teploty?",
    options: ["Zvýší se", "Sníží se", "Zůstane stejný", "Začne kmitat"],
    correctIndex: 1,
    explanation: "NTC (Negative Temperature Coefficient) znamená, že s rostoucí teplotou odpor klesá."
  },
  {
    id: 40,
    text: "Jak se nazývá oblast PN přechodu bez volných nosičů náboje?",
    options: ["Vodivá zóna", "Ochuzená vrstva (hradlová vrstva)", "Aktivní zóna", "Neutrální bod"],
    correctIndex: 1,
    explanation: "V této oblasti došlo k rekombinaci nosičů a vzniklo vnitřní elektrické pole."
  },
  {
    id: 41,
    text: "Která dioda se používá pro velmi rychlé spínání v počítačích?",
    options: ["Zenerova", "Schottkyho", "Usměrňovací", "LED"],
    correctIndex: 1,
    explanation: "Díky absenci minoritních nosičů náboje nemá Schottkyho dioda problém s dobou zotavení."
  },
  {
    id: 42,
    text: "Jaký je typický úbytek napětí na Schottkyho diodě?",
    options: ["0.2 - 0.4 V", "0.7 - 0.9 V", "1.5 - 2.0 V", "5.0 V"],
    correctIndex: 0,
    explanation: "Nízký úbytek napětí je jednou z hlavních výhod Schottkyho diod."
  },
  {
    id: 43,
    text: "Co znamená, že je dioda 'polarizovaná'?",
    options: [
      "Že je magnetická",
      "Že záleží na směru jejího zapojení v obvodu",
      "Že se může otáčet",
      "Že je vyrobena na pólu"
    ],
    correctIndex: 1,
    explanation: "Dioda propouští proud pouze jedním směrem, má tedy určenou polaritu (Anoda/Katoda)."
  },
  {
    id: 44,
    text: "Která část usměrňovače nejvíce trpí při zkratu na výstupu?",
    options: ["Kondenzátor", "Diody", "Transformátor", "Všechny zmíněné"],
    correctIndex: 3,
    explanation: "Zkrat způsobí průchod nadměrného proudu, který může zničit diody i transformátor a přetížit kondenzátor."
  },
  {
    id: 45,
    text: "Jak se značí katoda na pouzdru běžné diody?",
    options: ["Tečkou", "Proužkem", "Písmenem A", "Křížkem"],
    correctIndex: 1,
    explanation: "Proužek na pouzdru diody obvykle označuje katodu (záporný pól)."
  },
  {
    id: 46,
    text: "Co je to rekombinace?",
    options: [
      "Rozpad atomu",
      "Zánik páru elektron-díra",
      "Vznik nového polovodiče",
      "Nabíjení kondenzátoru"
    ],
    correctIndex: 1,
    explanation: "Rekombinace je proces, při kterém volný elektron zapadne do volného místa (díry)."
  },
  {
    id: 47,
    text: "Jaký vliv má teplota na prahové napětí diody?",
    options: [
      "S rostoucí teplotou prahové napětí klesá",
      "S rostoucí teplotou prahové napětí roste",
      "Teplota nemá žádný vliv",
      "Prahové napětí zmizí"
    ],
    correctIndex: 0,
    explanation: "U křemíkových diod klesá prahové napětí o cca 2 mV na každý stupeň Celsia."
  },
  {
    id: 48,
    text: "K čemu slouží vyhlazovací tlumivka (cívka)?",
    options: [
      "K filtraci napětí (brání změnám proudu)",
      "K zesílení napětí",
      "K měření frekvence",
      "K osvětlení"
    ],
    correctIndex: 0,
    explanation: "Cívka akumuluje energii v magnetickém poli a brání prudkým změnám proudu."
  },
  {
    id: 49,
    text: "Co je to stabilizátor s operačním zesilovačem?",
    options: [
      "Jednoduchá dioda",
      "Pokročilý obvod pro velmi přesné udržení napětí",
      "Součástka v pračce",
      "Druh baterie"
    ],
    correctIndex: 1,
    explanation: "Využívá zpětnou vazbu k dosažení mnohem vyšší stability než samotná Zenerova dioda."
  },
  {
    id: 50,
    text: "Proč se diody v můstku mohou zahřívat?",
    options: [
      "Kvůli tření elektronů",
      "Kvůli výkonové ztrátě na úbytku napětí (P = U * I)",
      "Kvůli slunečnímu záření",
      "Dioda se nezahřívá"
    ],
    correctIndex: 1,
    explanation: "I malý úbytek napětí (např. 0.7 V) při velkém proudu (např. 10 A) znamená ztrátu 7 W ve formě tepla."
  }
];
