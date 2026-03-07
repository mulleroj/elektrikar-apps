export interface Question {
  id: number;
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const allQuestions: Question[] = [
  {
    id: 1,
    q: "Který přístroj primárně chrání osoby před úrazem elektrickým proudem?",
    options: ["Jistič", "Proudový chránič", "Odpínač", "Stykač"],
    correct: 1,
    explanation: "Proudový chránič (RCD) reaguje na únik proudu mimo obvod, což může být právě přes tělo člověka."
  },
  {
    id: 2,
    q: "Co znamená zkratka MCB?",
    options: ["Motor Circuit Breaker", "Miniature Circuit Breaker", "Main Connection Board", "Manual Control Box"],
    correct: 1,
    explanation: "MCB je anglická zkratka pro jistič (Miniature Circuit Breaker)."
  },
  {
    id: 3,
    q: "Jaký je standardní reziduální proud chrániče pro ochranu osob v koupelnách?",
    options: ["100 mA", "300 mA", "30 mA", "500 mA"],
    correct: 2,
    explanation: "Norma ČSN vyžaduje pro ochranu osob v koupelnách a u zásuvek chránič s citlivostí 30 mA."
  },
  {
    id: 4,
    q: "K čemu slouží motorový spouštěč?",
    options: ["K regulaci otáček", "K ochraně motoru před přetížením a výpadkem fáze", "K reverzaci chodu", "K úspoře energie"],
    correct: 1,
    explanation: "Motorový spouštěč chrání vinutí motoru před spálením při přetížení nebo poruše napájení."
  },
  {
    id: 5,
    q: "Kde by měla být v rozvaděči umístěna přepěťová ochrana (SPD)?",
    options: ["Za všemi jističi", "Co nejblíže vstupu napájení", "U hlavního vypínače světel", "V každé zásuvce"],
    correct: 1,
    explanation: "SPD musí být co nejblíže vstupu, aby zachytila přepětí dříve, než se rozšíří do instalace."
  },
  {
    id: 6,
    q: "Jakou barvu má obvykle vodič PE (ochranný)?",
    options: ["Modrou", "Černou", "Zeleno-žlutou", "Hnědou"],
    correct: 2,
    explanation: "Ochranný vodič PE musí být vždy označen kombinací zelené a žluté barvy."
  },
  {
    id: 7,
    q: "Co se stane, když jističem protéká proud vyšší než jeho jmenovitý?",
    options: ["Jistič se zahřeje a po čase vypne", "Jistič okamžitě vybuchne", "Nic se nestane", "Jistič začne svítit"],
    correct: 0,
    explanation: "Tepelná spoušť jističe reaguje na mírné přetížení postupným zahřátím bimetalu a následným vypnutím."
  },
  {
    id: 8,
    q: "Který prvek se používá pro dálkové spínání velkých zátěží (např. topení)?",
    options: ["Vypínač č. 1", "Stykač", "Jistič", "SPD"],
    correct: 1,
    explanation: "Stykač umožňuje spínat silové obvody pomocí malého ovládacího napětí."
  },
  {
    id: 9,
    q: "Co chrání jistič (MCB)?",
    options: ["Životy lidí", "Vedení (kabely) před nadproudem", "Elektroniku před bleskem", "Úsporu energie"],
    correct: 1,
    explanation: "Hlavním úkolem jističe je chránit kabely před přehřátím a následným požárem."
  },
  {
    id: 10,
    q: "Jaký je účel schodišťového automatu?",
    options: ["Zrychlení výtahu", "Automatické vypnutí světla po nastaveném čase", "Měření spotřeby", "Ochrana před zkratem"],
    correct: 1,
    explanation: "Schodišťový automat šetří energii tím, že po určité době sám zhasne osvětlení."
  },
  {
    id: 11,
    q: "Může proudový chránič nahradit jistič?",
    options: ["Ano, vždy", "Ne, chránič nechrání proti nadproudu (pokud není kombinovaný)", "Ano, v koupelně", "Pouze u motorů"],
    correct: 1,
    explanation: "Standardní chránič (RCCB) neobsahuje nadproudovou ochranu, proto musí být předřazen jistič."
  },
  {
    id: 12,
    q: "Co je to selektivita jističů?",
    options: ["Výběr nejhezčího jističe", "Stav, kdy při poruše vypne jen jistič nejblíže místu závady", "Použití jističů stejné značky", "Rychlost vypnutí"],
    correct: 1,
    explanation: "Selektivita zajišťuje, že vypne jen postižený okruh a zbytek domu zůstane pod napětím."
  },
  {
    id: 13,
    q: "Která třída SPD se instaluje do hlavního domovního rozvaděče?",
    options: ["Třída D", "Třída T1+T2 (B+C)", "Pouze T3", "Žádná"],
    correct: 1,
    explanation: "V hlavním rozvaděči se obvykle kombinuje hrubá a střední ochrana (T1 a T2)."
  },
  {
    id: 14,
    q: "Jaký je rozdíl mezi stykačem a relé?",
    options: ["Žádný", "Stykač spíná větší výkony a má zhášecí komory", "Relé je větší", "Stykač je jen pro stejnosměrný proud"],
    correct: 1,
    explanation: "Stykače jsou konstruovány pro spínání silových zátěží, relé spíše pro pomocné a řídicí obvody."
  },
  {
    id: 15,
    q: "Proč se u motorů používá ochrana proti výpadku fáze?",
    options: ["Aby se motor točil rychleji", "Aby nedošlo k přehřátí a zničení vinutí při chodu na dvě fáze", "Kvůli úspoře", "Není to potřeba"],
    correct: 1,
    explanation: "Při výpadku jedné fáze se zbývající vinutí přetěžují, což vede k rychlému spálení motoru."
  },
  {
    id: 16,
    q: "Co znamená charakteristika 'B' u jističe?",
    options: ["Bleskový", "Standardní pro domovní instalace (světla, zásuvky)", "Pro motory", "Pro transformátory"],
    correct: 1,
    explanation: "Charakteristika B je určena pro běžné spotřebiče bez velkých rozběhových proudů."
  },
  {
    id: 17,
    q: "Kdy použijeme jistič s charakteristikou 'C'?",
    options: ["Nikdy", "U spotřebičů s vyšším rozběhovým proudem (motory, čerpadla)", "Jen pro LED světla", "Pro hračky"],
    correct: 1,
    explanation: "Charakteristika C dovoluje krátkodobý vyšší proud při startu zařízení."
  },
  {
    id: 18,
    q: "Co je to 'nulování'?",
    options: ["Vynásobení nulou", "Starší způsob ochrany spojením neživé části s vodičem PEN", "Vypnutí proudu", "Resetování elektroměru"],
    correct: 1,
    explanation: "Nulování byla ochrana v sítích TN-C, dnes nahrazená modernějším systémem TN-S s chrániči."
  },
  {
    id: 19,
    q: "Jak často by se mělo testovat testovací tlačítko na chrániči?",
    options: ["Jednou za 10 let", "Pravidelně (dle doporučení výrobce, např. 1x měsíčně)", "Nikdy", "Jen při revizi"],
    correct: 1,
    explanation: "Pravidelné testování zajišťuje, že mechanika chrániče nezatuhne a v případě nouze vypne."
  },
  {
    id: 20,
    q: "Který vodič se nesmí nikdy jistit ani vypínat (kromě speciálních případů)?",
    options: ["Fázový (L)", "Ochranný (PE)", "Střední (N)", "Všechny se jistí"],
    correct: 1,
    explanation: "Ochranný vodič PE musí být nepřerušený, aby byla zajištěna bezpečnost při poruše."
  },
  {
    id: 21,
    q: "Co je to zkrat?",
    options: ["Krátký kabel", "Vodivé spojení mezi fází a nulou nebo zemí s minimálním odporem", "Vypnutí vypínače", "Úsporný režim"],
    correct: 1,
    explanation: "Při zkratu protéká obvodem extrémně vysoký proud, který musí jistič okamžitě přerušit."
  },
  {
    id: 22,
    q: "Jaký je hlavní rozdíl mezi sítí TN-C a TN-S?",
    options: ["TN-S má oddělený vodič PE a N", "TN-C je modernější", "TN-S nemá uzemnění", "Žádný"],
    correct: 0,
    explanation: "V síti TN-S jsou ochranný (PE) a střední (N) vodič vedeny samostatně, což umožňuje použití chráničů."
  },
  {
    id: 23,
    q: "K čemu slouží hlavní vypínač v rozvaděči?",
    options: ["K zapnutí televize", "K bezpečnému odpojení celé instalace od napětí", "K regulaci jasu", "K ochraně před bleskem"],
    correct: 1,
    explanation: "Hlavní vypínač umožňuje rychle odpojit celý objekt v případě požáru nebo opravy."
  },
  {
    id: 24,
    q: "Co je to 'doutnavka' ve vypínači?",
    options: ["Malá žárovka pro orientaci ve tmě", "Součást jističe", "Druh pojistky", "Senzor pohybu"],
    correct: 0,
    explanation: "Doutnavka nebo LED ve vypínači slouží k jeho snadnému nalezení v noci."
  },
  {
    id: 25,
    q: "Jaký průřez vodiče se obvykle používá pro světelné okruhy (jistič 10A)?",
    options: ["4 mm²", "1.5 mm²", "0.75 mm²", "10 mm²"],
    correct: 1,
    explanation: "Pro standardní světelné okruhy jištěné 10A se používá měděný vodič o průřezu 1.5 mm²."
  },
  {
    id: 26,
    q: "Jaký průřez vodiče se obvykle používá pro zásuvkové okruhy (jistič 16A)?",
    options: ["1.5 mm²", "2.5 mm²", "6 mm²", "1 mm²"],
    correct: 1,
    explanation: "Zásuvkové okruhy jištěné 16A vyžadují měděný vodič o průřezu 2.5 mm²."
  },
  {
    id: 27,
    q: "Co znamená IP krytí (např. IP44)?",
    options: ["Internetový protokol", "Stupeň ochrany před vniknutím cizích těles a vody", "Cena přístroje", "Výrobce"],
    correct: 1,
    explanation: "IP kód udává odolnost zařízení proti prachu (první číslice) a vodě (druhá číslice)."
  },
  {
    id: 28,
    q: "Které IP krytí je minimálně vyžadováno do venkovního prostředí?",
    options: ["IP20", "IP44", "IP00", "IP10"],
    correct: 1,
    explanation: "IP44 zajišťuje ochranu proti stříkající vodě, což je pro běžné venkovní použití nezbytné."
  },
  {
    id: 29,
    q: "Co je to 'hřebenová lišta'?",
    options: ["Nástroj na vlasy", "Propojovací lišta pro jističe v rozvaděči", "Druh kabelu", "Součást motoru"],
    correct: 1,
    explanation: "Hřebenová lišta slouží k rychlému a bezpečnému propojení přívodů řady jističů."
  },
  {
    id: 30,
    q: "K čemu slouží popisové štítky v rozvaděči?",
    options: ["Pro ozdobu", "Pro jasnou identifikaci, co který jistič vypíná", "Pro výrobce", "Není to důležité"],
    correct: 1,
    explanation: "Správné označení jističů je klíčové pro bezpečnost a orientaci při poruše."
  },
  {
    id: 31,
    q: "Co je to 'bimetal' v jističi?",
    options: ["Dva spojené kovy s různou tepelnou roztažností", "Druh plastu", "Značka jističe", "Typ drátu"],
    correct: 0,
    explanation: "Bimetal se při průchodu nadproudu ohýbá a mechanicky uvolňuje spoušť jističe."
  },
  {
    id: 32,
    q: "Jaký je rozdíl mezi 1-pólovým a 3-pólovým jističem?",
    options: ["Barva", "Počet hlídaných a vypínaných fází", "Cena", "Váha"],
    correct: 1,
    explanation: "1-pólový jistí jednu fázi (230V), 3-pólový jistí tři fáze (400V, např. pro sporák nebo motor)."
  },
  {
    id: 33,
    q: "Co se stane, když dojde k přerušení vodiče PEN v síti TN-C?",
    options: ["Nic", "Na neživých částech se může objevit nebezpečné napětí", "Světla budou svítit víc", "Ušetříte"],
    correct: 1,
    explanation: "Přerušení PEN je extrémně nebezpečné, protože spotřebiče ztratí ochranu i nulový bod."
  },
  {
    id: 34,
    q: "Proč se v koupelně nesmí umisťovat zásuvky blízko vany?",
    options: ["Kvůli designu", "Kvůli riziku vniknutí vody a úrazu", "Zásuvky tam nefungují", "Je to zakázáno zákonem o tichu"],
    correct: 1,
    explanation: "Voda zvyšuje riziko úrazu, proto norma definuje zóny, kde zásuvky nesmí být."
  },
  {
    id: 35,
    q: "Co je to 'doutnavkový zkoušeč' (fázovka)?",
    options: ["Nástroj na měření teploty", "Jednoduchý indikátor přítomnosti napětí na fázi", "Druh šroubováku na všechno", "Hračka"],
    correct: 1,
    explanation: "Fázovka slouží k rychlému ověření, zda je v zásuvce nebo na vodiči napětí."
  },
  {
    id: 36,
    q: "K čemu slouží revize elektroinstalace?",
    options: ["Pro vyhození peněz", "K ověření bezpečnosti a souladu s normami", "Pro policii", "Kvůli barvě stěn"],
    correct: 1,
    explanation: "Revize odhalí skryté závady, které by mohly způsobit požár nebo úraz."
  },
  {
    id: 37,
    q: "Jaký je symbol pro proudový chránič ve schématech?",
    options: ["Kroužek s křížkem", "Obdélník s vlnovkou a symbolem součtu proudů", "Trojúhelník", "Čtverec"],
    correct: 1,
    explanation: "Chránič se značí specifickým symbolem zdůrazňujícím rozdílový transformátor."
  },
  {
    id: 38,
    q: "Co je to 'přípojnice'?",
    options: ["Zastávka autobusu", "Masivní měděný nebo hliníkový pás pro rozvod velkých proudů", "Druh jističe", "Kabel k PC"],
    correct: 1,
    explanation: "Přípojnice se používají v průmyslových rozvaděčích pro hlavní rozvody energie."
  },
  {
    id: 39,
    q: "Může být chránič zapojen před elektroměrem?",
    options: ["Ano", "Ne, obvykle je až v domovním rozvaděči", "Jen u chaty", "Pouze v noci"],
    correct: 1,
    explanation: "Chránič se instaluje do vnitřní instalace, před elektroměrem je pouze hlavní jistič."
  },
  {
    id: 40,
    q: "Co znamená 'vypínací schopnost' jističe (např. 6kA)?",
    options: ["Maximální proud, který jistič bezpečně vypne při zkratu", "Váha jističe", "Počet sepnutí", "Napětí"],
    correct: 0,
    explanation: "Udává, jak velký zkratový proud dokáže jistič přerušit, aniž by se zničil nebo způsobil požár."
  },
  {
    id: 41,
    q: "Proč se používají dutinky na koncích laněných (ohebných) vodičů?",
    options: ["Pro ozdobu", "Aby se jednotlivé drátky neroztřepily a spoj byl pevný", "Kvůli barvě", "Není to potřeba"],
    correct: 1,
    explanation: "Dutinky zajišťují kvalitní kontakt ve svorkách a brání přehřívání spoje."
  },
  {
    id: 42,
    q: "Co je to 'vypínač s řazením 6'?",
    options: ["Vypínač pro 6 světel", "Schodišťový vypínač (ovládání světla ze dvou míst)", "Druh jističe", "Vypínač s 6 tlačítky"],
    correct: 1,
    explanation: "Řazení 6 se používá na chodbách, kde chcete světlo rozsvítit na jednom konci a zhasnout na druhém."
  },
  {
    id: 43,
    q: "Co je to 'vypínač s řazením 7'?",
    options: ["Křížový vypínač (pro ovládání ze 3 a více míst)", "Vypínač pro 7 fází", "Speciální jistič", "Časovač"],
    correct: 0,
    explanation: "Křížový vypínač se vkládá mezi dva schodišťové vypínače (řazení 6)."
  },
  {
    id: 44,
    q: "Jaký je rozdíl mezi AC a DC proudem?",
    options: ["AC je střídavý, DC je stejnosměrný", "AC je jen pro baterie", "DC je v zásuvkách", "Žádný"],
    correct: 0,
    explanation: "V běžných zásuvkách máme AC (střídavý), v bateriích nebo solárních panelech DC (stejnosměrný)."
  },
  {
    id: 45,
    q: "Proč se nesmí hasit elektrické zařízení pod napětím vodou?",
    options: ["Voda je drahá", "Voda je vodivá a hrozí úraz elektrickým proudem", "Voda zařízení ochladí moc rychle", "Voda nehasí oheň"],
    correct: 1,
    explanation: "Voda vede proud zpět k hasiči, což může být smrtelné. Používají se sněhové nebo práškové přístroje."
  },
  {
    id: 46,
    q: "Co je to 'přechodový odpor'?",
    options: ["Odpor při přechodu hranic", "Odpor v místě spoje vodičů", "Druh jističe", "Napětí v síti"],
    correct: 1,
    explanation: "Vysoký přechodový odpor (např. uvolněný šroubek) způsobuje zahřívání a může vést k požáru."
  },
  {
    id: 47,
    q: "K čemu slouží 'ekvipotenciální svorkovnice' (EPS)?",
    options: ["K měření elektřiny", "K hlavnímu pospojování a vyrovnání potenciálů v domě", "K nabíjení aut", "K ničemu"],
    correct: 1,
    explanation: "EPS spojuje všechny kovové části domu (trubky, konstrukce) se zemí pro zvýšení bezpečnosti."
  },
  {
    id: 48,
    q: "Co je to 'předřazená pojistka'?",
    options: ["Pojistka v autě", "Pojistka nebo jistič umístěný před daným zařízením pro jeho ochranu", "Záložní plán", "Druh vypínače"],
    correct: 1,
    explanation: "Předřazené jištění chrání citlivější prvky (např. SPD nebo stykač) před zničením zkratem."
  },
  {
    id: 49,
    q: "Jaký je rozdíl mezi fází a nulou?",
    options: ["Fáze je pod napětím proti zemi, nula je (ideálně) na potenciálu země", "Žádný", "Nula je nebezpečnější", "Fáze je modrá"],
    correct: 0,
    explanation: "Fáze přivádí energii, nula (střední vodič) slouží jako zpětná cesta proudu."
  },
  {
    id: 50,
    q: "Co je to 'indukce' v kabelech?",
    options: ["Druh vaření", "Vznik napětí v blízkém vodiči vlivem magnetického pole", "Vypnutí jističe", "Způsob nákupu kabelů"],
    correct: 1,
    explanation: "Indukce může způsobit, že se na odpojeném kabelu objeví 'duchovité' napětí, pokud vede vedle jiného kabelu pod zátěží."
  }
];
