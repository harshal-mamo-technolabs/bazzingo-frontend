import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';
import { TestbrainTermsBody } from '../components/legal/TestbrainLegalContent.jsx';
import { COUNTRY_PROFILE_CONTROLS, applyPlatformBrandToText } from '../config/accessControl.js';

const sectionStyle = { marginBottom: '24px' };
const headingStyle = { fontFamily: 'Inter, sans-serif', fontSize: '16px', fontWeight: '600', marginBottom: '12px' };
const bodyStyle = { fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };
const TERMS_CONTACT_EMAIL = 'lumria.sk@silverlines.info';

function TermsOfUse() {
    const navigate = useNavigate();

    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex,follow';
        meta.setAttribute('data-bazzingo-page-robots', '');
        document.head.appendChild(meta);
        return () => {
            meta.remove();
        };
    }, []);

    const activeCountry = COUNTRY_PROFILE_CONTROLS?.activeCountry;
    const isGermany = activeCountry === 'Germany';
    const isSlovakia = activeCountry === 'Slovakia';
    const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
    const isTestbrainDomain = hostname === 'testbrain.net' || hostname.endsWith('.testbrain.net');

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            <Header unreadCount={3} />
            <main>
                <div className="mx-auto px-4 lg:px-12 pt-4">
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft style={{ height: '14px', width: '14px', marginRight: '8px' }} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                        <h2 className="text-gray-900 text-lg lg:text-xl" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}><TranslatedText text="Terms of Use" /></span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}><TranslatedText text="Terms of Use" /></span>
                        </h2>
                    </div>
                    <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400' }}>
                        <TranslatedText text="By using Bazingo, you agree to the following terms and conditions." />
                    </p>
                    {isTestbrainDomain ? (
                        <h3 className="text-gray-900 mt-4" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '18px', fontWeight: '600' }}>
                            <TranslatedText text="Terms & conditions" />
                        </h3>
                    ) : null}
                </div>

                <div className="mx-auto px-4 lg:px-12 py-4">
                    <div className="max-w-[800px]">
                        {isTestbrainDomain ? (
                            <TestbrainTermsBody />
                        ) : isSlovakia ? (
                            <>
                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>Obchodné Podmienky</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        {applyPlatformBrandToText('Bazingo so sídlom na adrese: Comparo media, Mühlegasse 6. 6340 Baar, Švajčiarsko, Bazingo ďalej označovaná iba ako „poskytovateľ", „my", „nás", „naše" a podobne) ponúka program na tréning mozgu a ďalšie služby optimalizované pre mobilné zariadenia. Tieto služby sú dostupné v podobe prehliadačovej aplikácie („služby").')}
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Navštívením webu alebo príslušných stránok WAP („stránky") a/alebo zaregistrovaním služieb súhlasíte s tým, že s nami vstupujete do záväzného zmluvného vzťahu, ktorý sa riadi Zmluvnými podmienkami a Pravidlami ochrany súkromia. Nájdite si, prosím, čas na prečítanie Zmluvných podmienok a ich pochopenie. Ak so Zmluvnými podmienkami, ako aj Pravidlami ochrany súkromia nesúhlasíte, žiadame vás, aby ste stránky ani služby nepoužívali.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Zmluvné podmienky a Pravidlá ochrany súkromia môžeme príležitostne aktualizovať. Tieto zmeny budú tvoriť súčasť Zmluvných podmienok aj v prípade, že stránky nebudete znova používať. Za oboznámenie sa s doplnkami alebo úpravami Zmluvných podmienok a Pravidiel ochrany súkromia nesiete zodpovednosť vy.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>1. PRIJATIE PODMIENOK</h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Navštívením stránok a/alebo zaregistrovaním služieb súhlasíte s tým, že vstupujete do záväzného zmluvného vzťahu s poskytovateľom v súlade s týmito Zmluvnými podmienkami a Pravidlami ochrany súkromia. Ak s nimi nesúhlasíte, nesmiete stránky ani služby používať.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>2. PRÍSTUP A DOSTUPNOSŤ</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Úplný prístup k službám je poskytovaný na základe spoplatneného odberu, ktorý sa dá zakúpiť na rôzne obdobia a ak ho nezrušíte, automaticky sa obnoví. Našim odberateľom poskytujeme úplný prístup k obsahu, pokým majú aktívny odber.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        <strong>Cena služby:</strong> 6,15 €/týždeň s DPH. Kľúčové slovo: LUM. Krátke číslo: 7402.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Poplatky sú splatné pri zakúpení odberu bez ohľadu na to, či budete službu reálne používať alebo nie. Nárok na účtovanie poplatku vzniká výlučne na základe poskytovania práva na sťahovanie, prijímanie a/alebo používanie obsahu.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Súhlasíte, že včas zaplatíte akékoľvek poplatky, tarify alebo iné sumy, ktoré vzniknú pri vytváraní odberu. Služba je poskytovaná „ako stojí a leží" v čase používania alebo spotreby a poskytovateľ nepreberá žiadnu zodpovednosť ani neposkytuje záruky, ak osobné okolnosti, informácie alebo správy nebudú uložené, odstránia sa alebo budú doručené nesprávne.
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Na úplné využívanie našej služby musíte mať prostriedky mobilnej komunikácie s prístupom na internet. Niektoré bezdrôtové aplikácie sú dostupné iba pre vybraný počet mobilných zariadení, čo je mimo kontroly poskytovateľa. Pred prihlásením sa na odber služby si overte kompatibilitu svojho zariadenia.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>3. VEKOVÉ OBMEDZENIE</h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Ak chcete používať službu, musíte dosiahnuť príslušný vek podľa pravidiel a nariadení vo vašej krajine sídla a mať povolenie platiteľa účtu na registráciu a používanie služby v jeho mene. V mene platiteľa účtu aj seba súhlasíte, že sa pre vás stanú záväzné tieto Zmluvné podmienky a Pravidlá ochrany súkromia.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>4. POPLATKY</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Za získanie úplného prístupu k službe vám budeme účtovať príslušné poplatky. Poplatky budú fakturované prostredníctvom mobilnej faktúry od vášho mobilného operátora alebo cez iný zvolený spôsob platby. Môžu sa uplatňovať aj samostatné poplatky za textové správy alebo sieťové poplatky od vášho mobilného operátora.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        V bezplatnej uvítacej správe od poskytovateľa nájdete informácie o poplatku za službu a frekvencii poskytovania služby. Poskytovateľ si vyhradzuje právo meniť poplatky, pričom o zmene budete informovaní primeraným spôsobom. Ak s novými poplatkami nesúhlasíte (na perspektívnej báze), môžete svoj odber zrušiť po ukončení.
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Ak chcete otvoriť spor v súvislosti s akoukoľvek uskutočnenou platbou, musíte nás okamžite kontaktovať a poskytnúť všetky relevantné údaje o vašom spore.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>5. BEZPEČNOSTNÉ A REGISTRAČNÉ POVINNOSTI</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Na zaručenie bezpečného používania služby, ako aj platby príslušných poplatkov sa musíte zaregistrovať a poskytnúť presné a úplné zaregistrované informácie. Ak poskytovateľ zistí, že informácie nie sú presné alebo úplné, môže pozastaviť alebo zrušiť váš účet a obmedziť prístup k službám.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Zodpovedáte za uchovávanie tajnosti akýchkoľvek hesiel a/alebo účtov, ktoré vám poskytovateľ vydá, a za všetky akcie vykonané s použitím vášho hesla alebo účtu. V prípade neautorizovaného použitia alebo podozrenia z narušenia zabezpečenia ste povinní kontaktovať poskytovateľa. Poskytovateľ môže poskytovať prístup k niektorým službám bez registrácie, napríklad prostredníctvom identifikácie vaším mobilným telefónnym číslom.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>6. ZMENY SLUŽIEB</h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Vyhradzujeme si právo kedykoľvek inovovať, doplniť, pozastaviť alebo ukončiť služby bez predchádzajúceho upozornenia. Súhlasíte, že neponesieme zodpovednosť voči vám ani tretej strane za akékoľvek doplnenie, pozastavenie alebo ukončenie služieb a nevzniká vám nárok na kompenzáciu či platbu.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>7. KÓDEX SPRÁVANIA</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        Súhlasíte, že služby budete používať v súlade s nasledujúcim kódexom správania:
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>služby nebudete používať na žiadne nezákonné, neautorizované ani komerčné účely;</li>
                                        <li>informácie poskytnuté prostredníctvom služby budete uchovávať ako súkromné a dôverné;</li>
                                        <li>nebudete sa dopúšťať žiadnej formy obťažovania alebo pohoršlivého správania;</li>
                                        <li>nebudete porušovať vlastnícke, autorské, osobnostné ani iné práva poskytovateľa či tretej strany;</li>
                                        <li>nebudete službu používať podvodným alebo inak nezákonným spôsobom a nebudete porušovať právne predpisy;</li>
                                        <li>nebudete reprodukovať, kopírovať, predávať ani ďalej poskytovať službu;</li>
                                        <li>zabezpečíte, aby vaše vybavenie ani softvér nenarušovali prevádzku poskytovateľa.</li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>8. PORUŠENIE PRAVIDIEL</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        Ak porušíte tieto Zmluvné podmienky alebo ak máme opodstatnený dôvod sa domnievať, že ste ich porušili, môžeme:
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>poslať vám jedno alebo viac formálnych varovaní;</li>
                                        <li>dočasne pozastaviť váš prístup k službám;</li>
                                        <li>natrvalo zakázať váš prístup k službám;</li>
                                        <li>zablokovať prístup k službám z vašej IP adresy;</li>
                                        <li>kontaktovať poskytovateľov internetových služieb a požiadať ich o blokovanie prístupu;</li>
                                        <li>podniknúť voči vám právne kroky;</li>
                                        <li>pozastaviť alebo odstrániť váš účet.</li>
                                    </ul>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Súhlasíte, že v prípade zablokovania alebo zákazu prístupu k službám nemáte nárok na refundáciu už zaplateného poplatku za odber a nesmiete sa pokúšať takéto opatrenia obísť (napr. vytváraním nových účtov).
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>9. PRAVIDLÁ OCHRANY SÚKROMIA</h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Používanie vašich osobných údajov sa riadi našimi Pravidlami ochrany súkromia, ktoré tvoria neoddeliteľnú súčasť týchto Zmluvných podmienok. Odsúhlasením Zmluvných podmienok súhlasíte aj so spracovaním vašich osobných údajov podľa Pravidiel ochrany súkromia.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>10. ODŠKODNENIE</h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Súhlasíte, že odškodníte, budete obhajovať a chrániť poskytovateľa, jeho pridružené spoločnosti, partnerov, subdodávateľov a ich zástupcov pred všetkými nárokmi, škodami, súdnymi spormi, požiadavkami a zodpovednosťami vzniknutými v dôsledku: (i) vášho používania služby, obsahu, softvéru a stránok; (ii) porušenia Zmluvných podmienok; (iii) porušenia akýchkoľvek tvrdení alebo záruk; alebo (iv) porušenia akýchkoľvek právnych predpisov či práv tretej strany.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>11. STORNOVANIE A ZRUŠENIE</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Informácie o ukončení služieb a prerušení poskytovania informácií cez SMS nájdete na stránkach služby a v bezplatnej uvítacej správe. Službu môžete zrušiť aj e-mailom na adrese <strong>{TERMS_CONTACT_EMAIL}</strong>.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Na zrušenie služby pošlite SMS s textom <strong>BAZINGO STOP</strong> na číslo <strong>7402</strong>.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Ak je vaša krajina trvalého bydliska súčasťou Európskej únie, máte právo odstúpiť od odberu do 14 dní bez uvedenia dôvodu. Po odstúpení budú všetky platby refundované bez zbytočného odkladu, najneskôr do 14 dní od oznámenia odstúpenia. V prípade využívania služieb počas obdobia odstúpenia zaplatíte pomernú časť ceny za už poskytnuté služby. Právo na odstúpenie sa neuplatňuje na obnovenie odberu.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>12. REKLAMA</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        V miere povolenej právom vašej krajiny môžeme v rámci služieb zobrazovať reklamy a promá. Súhlasíte, že tieto reklamy nebudete blokovať ani do nich inak zasahovať. Vaše osobné údaje nebudeme zdieľať s tretími stranami bez vášho súhlasu. Uvedenie akejkoľvek reklamy neznamená, že poskytovateľ daný obsah alebo produkty podporuje.
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Poskytovateľ nenesie zodpovednosť za žiadne škody vzniknuté v dôsledku transakcií s tretími stranami, ktorých produkty alebo služby sú propagované prostredníctvom našich stránok alebo služieb.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>13. PRÁVA DUŠEVNÉHO VLASTNÍCTVA</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Softvér, stránky a služby obsahujú informácie a značky chránené zákonmi o autorských právach, obchodnom tajomstve, ochranných známkach a inými právami duševného vlastníctva. Všetky práva duševného vlastníctva patria poskytovateľovi.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Nezískavate žiadne vlastnícke práva k týmto právam a nesmiete softvér ani obsah kopírovať, upravovať, prenajímať, predávať, distribuovať, vykonávať reverzné inžinierstvo ani z nich vytvárať odvodené diela bez predchádzajúceho písomného súhlasu poskytovateľa.
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Poskytovateľ vám udeľuje osobnú, obmedzenú, neprenosnú, nevýhradnú a odvolateľnú licenciu na používanie softvéru a obsahu výhradne pre vaše vlastné nekomerčné používanie služieb v súlade s týmito Zmluvnými podmienkami.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>14. ŽIADNA ZÁRUKA</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Služba, obsah, softvér a stránky sú poskytované „ako stoja a ležia" a „ako sú dostupné" bez akýchkoľvek záruk. V maximálnom rozsahu povolenom zákonom sa poskytovateľ vzdáva všetkých výslovných aj domnelých záruk, vrátane záruk obchodovateľnosti, vhodnosti na konkrétny účel a neporušenia vlastníckych práv.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Strany poskytovateľa sa vzdávajú všetkých záruk týkajúcich sa bezpečnosti, spoľahlivosti, včasnosti a výkonu služby, obsahu, softvéru a stránok. Službu používate výhradne na vlastné riziko.
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Obrázky osôb uvedené na stránkach a/alebo v službách slúžia iba na ilustračné účely a nejde o skutočných ľudí poskytujúcich služby. Poskytovateľ nenesie zodpovednosť za nesprávne prezentácie nápadov alebo faktov v obsahu a/alebo na stránkach.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>15. OBMEDZENIA ZODPOVEDNOSTI</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Za žiadnych okolností strany poskytovateľa nenesú zodpovednosť za priame, nepriame, neúmyselné, výnimočné, trestné alebo následné škody vyplývajúce z vášho používania alebo nemožnosti používať službu, obsah, softvér a stránky. V jurisdikciách, kde takéto obmedzenia nie sú povolené, sa môžu uplatňovať len v rozsahu dovolenom zákonom.
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Celková zodpovednosť strán poskytovateľa voči vám za všetky škody nepresiahne sumu, ktorú ste zaplatili za registráciu do služby.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>16. VŠEOBECNÉ INFORMÁCIE</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Tieto Zmluvné podmienky a Pravidlá ochrany súkromia tvoria celú právnu dohodu medzi vami a poskytovateľom a nahrádzajú všetky predchádzajúce dohody v súvislosti so stránkami alebo službami. Súhlasíte, že medzi vami a poskytovateľom nevzniká spoločný podnik, zamestnanie ani agentúrny vzťah iba na základe používania stránok alebo služieb.
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Nemôžete preniesť žiadne svoje práva ani delegovať svoje povinnosti bez predchádzajúceho písomného súhlasu poskytovateľa. Nič v tejto zmluve neovplyvňuje vaše štatutárne práva ako spotrebiteľa.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>17. ROZHODUJÚCE PRÁVO, JURISDIKCIA A ODDELITEĽNOSŤ</h3>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Na vzťah medzi vami a poskytovateľom sa uplatňujú národné právne predpisy vašej krajiny bez ohľadu na kolízne normy. Spory budú postúpené na konečnú a záväznú arbitráž podľa pravidiel rozhodcovského združenia vo vašej krajine. Uplatnenie Dohovoru OSN o zmluvách o medzinárodnej kúpe tovaru je výslovne vylúčené.
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        Ak bude akékoľvek ustanovenie Zmluvných podmienok určené za neplatné alebo nevymáhateľné, takéto rozhodnutie neovplyvní platnosť ostatných ustanovení, ktoré zostávajú v plnej platnosti.
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>DODATOK A – Formulár odvolania (európsky model)</h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        Tento formulár vyplňte a vráťte iba v prípade, že chcete odstúpiť od nákupu:
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        Na: {applyPlatformBrandToText('Bazingo')}, <a href={`mailto:${TERMS_CONTACT_EMAIL}`} className="text-blue-600 underline">{TERMS_CONTACT_EMAIL}</a>
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        Ja/My (*) týmto oznamujem/oznamujeme (*), že odstupujem/odstupujeme od predajnej zmluvy pre nasledujúci tovar (*)/na poskytovanie nasledujúcej služby (*), objednané/prijaté (*), mená spotrebiteľov, adresa spotrebiteľov, podpisy spotrebiteľov (iba pri papierovej forme), dátum. (*) nepodstatné prečiarknite.
                                    </p>
                                </div>
                            </>
                        ) : isGermany ? (
                            <>
                                <p className="text-gray-600 mb-6" style={bodyStyle}>
                                    <TranslatedText text="These Terms and Conditions govern your use of the Bazzingo IQ testing and brain training platform. By using our services, you agree to these terms. Please read them carefully." />
                                </p>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Acceptance of Terms" />
                                    </h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="By creating an account, accessing, or using our services, you agree to be bound by these Terms and Conditions, our Privacy Policy, and all applicable laws and regulations. If you do not agree with these terms, please do not use our services." />
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Service Provider" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Company Name:" />
                                        </strong>{' '}
                                        <TranslatedText text="Bazzingo" />
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Contact Email:" />
                                        </strong>{' '}
                                        <a href={`mailto:${TERMS_CONTACT_EMAIL}`} className="text-blue-600 underline">
                                            {TERMS_CONTACT_EMAIL}
                                        </a>
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="Bazzingo is a digital service providing IQ tests, cognitive assessments, and brain training games to users in the European Union and worldwide." />
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Service Description" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="Bazzingo provides:" />
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="Online IQ tests and cognitive assessments" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Personalized IQ certificates" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Brain training games and exercises" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Performance tracking and analytics" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Detailed cognitive assessment reports" />
                                        </li>
                                    </ul>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="Our tests are designed for entertainment and self-improvement purposes and do not constitute official psychological assessments." />
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Subscription &amp; Payment" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Trial Period:" />
                                        </strong>
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="3-day trial for €2.99" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Full access to all features during trial" />
                                        </li>
                                        <li>
                                            <TranslatedText text="After trial, automatically converts to monthly subscription" />
                                        </li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Monthly Subscription:" />
                                        </strong>
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="Auto-renews each month" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Charged on the same day as initial payment" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Prices are clearly displayed before purchase" />
                                        </li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Payment Processing:" />
                                        </strong>
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="All payments are processed securely via Stripe" />
                                        </li>
                                        <li>
                                            <TranslatedText text="We accept credit/debit cards" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Prices include VAT where applicable" />
                                        </li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Right of Withdrawal (EU Consumers)" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="Under the EU Consumer Rights Directive, you have the right to withdraw from this contract within 14 days without giving any reason." />
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Important Notice Regarding Digital Content:" />
                                        </strong>
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="By beginning to use our digital services (taking IQ tests, playing games, accessing reports) during the withdrawal period, you expressly consent to:" />
                                    </p>
                                    <ol className="list-decimal pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="The performance of the digital content beginning immediately" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Acknowledge that you will lose your right of withdrawal once you have started testing or downloaded digital content" />
                                        </li>
                                    </ol>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="This is in accordance with Article 16(m) of the EU Consumer Rights Directive." />
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="To Exercise Withdrawal:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="Contact us at" />{' '}
                                        <a href={`mailto:${TERMS_CONTACT_EMAIL}`} className="text-blue-600 underline">
                                            {TERMS_CONTACT_EMAIL}
                                        </a>{' '}
                                        <TranslatedText text="before using the service." />
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Cancellation Policy" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="How to Cancel Your Subscription:" />
                                        </strong>
                                    </p>
                                    <ol className="list-decimal pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="Log in to your Bazzingo account" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Go to Account Settings → Subscription" />
                                        </li>
                                        <li>
                                            <TranslatedText text='Click "Cancel Subscription"' />
                                        </li>
                                        <li>
                                            <TranslatedText text="Your access continues until the end of the current billing period" />
                                        </li>
                                    </ol>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="Alternatively:" />
                                        <br />
                                        <TranslatedText text="Send an email to" />{' '}
                                        <a href={`mailto:${TERMS_CONTACT_EMAIL}`} className="text-blue-600 underline">
                                            {TERMS_CONTACT_EMAIL}
                                        </a>{' '}
                                        <TranslatedText text="with your cancellation request." />
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Important Notes:" />
                                        </strong>
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="Cancellation must be made at least 24 hours before the next billing date" />
                                        </li>
                                        <li>
                                            <TranslatedText text="No further charges after cancellation" />
                                        </li>
                                        <li>
                                            <TranslatedText text="No prorated refunds for partial months" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Your test data and certificates remain accessible upon request" />
                                        </li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Intellectual Property" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="All content on the Bazzingo platform is protected:" />
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="All IQ test questions, algorithms, and methodologies" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Brain training games and exercises" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Certificate designs and templates" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Report formats and analytics" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Website design and user interface" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Trademarks, logos, and branding" />
                                        </li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="You may not:" />
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="Copy, modify, or distribute our content without permission" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Reverse engineer or extract our technology" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Use our materials for commercial purposes without licensing" />
                                        </li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Disclaimer" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="For Entertainment Purposes:" />
                                        </strong>
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="Bazzingo IQ tests are designed for entertainment and self-improvement purposes. They are:" />
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="NOT official psychological assessments" />
                                        </li>
                                        <li>
                                            <TranslatedText text="NOT substitutes for professional cognitive testing" />
                                        </li>
                                        <li>
                                            <TranslatedText text="NOT to be used for diagnostic or medical purposes" />
                                        </li>
                                        <li>
                                            <TranslatedText text="NOT to be used for educational placement decisions" />
                                        </li>
                                    </ul>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Results:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="IQ scores and cognitive metrics are estimates based on your test responses. They may not fully reflect your actual cognitive abilities and should not be used for important life decisions." />
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Professional Advice:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="For official IQ testing or cognitive assessments, please consult a licensed psychologist." />
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Limitation of Liability" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="To the maximum extent permitted by applicable law:" />
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="Bazzingo is not liable for indirect, incidental, or consequential damages" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Our total liability shall not exceed the amount you paid us in the last 12 months" />
                                        </li>
                                        <li>
                                            <TranslatedText text="We do not guarantee specific results from using our services" />
                                        </li>
                                    </ul>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="EU Consumer Rights:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="These limitations do not affect your statutory rights under EU consumer protection laws, including rights related to defective digital content or services." />
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Dispute Resolution" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Online Dispute Resolution:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="The European Commission provides a platform for online dispute resolution:" />{' '}
                                        <a
                                            href="https://ec.europa.eu/consumers/odr"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            https://ec.europa.eu/consumers/odr
                                        </a>
                                    </p>
                                    <p className="text-gray-600 mb-4" style={bodyStyle}>
                                        <TranslatedText text="We encourage you to contact us first to resolve disputes amicably." />
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Governing Law:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="These terms are governed by the laws of the European Union and the member state where you reside." />
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Jurisdiction:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="Disputes may be brought before the courts of your residence or our place of business." />
                                    </p>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Amendments" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="We may update these terms from time to time:" />
                                    </p>
                                    <ul className="list-disc pl-6 text-gray-600 mb-4" style={bodyStyle}>
                                        <li>
                                            <TranslatedText text="Material changes will be notified 30 days in advance via email" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Minor changes will be posted on this page" />
                                        </li>
                                        <li>
                                            <TranslatedText text="Continued use after changes constitutes acceptance" />
                                        </li>
                                        <li>
                                            <TranslatedText text='The "Last Updated" date indicates the current version' />
                                        </li>
                                    </ul>
                                </div>

                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}>
                                        <TranslatedText text="Contact Us" />
                                    </h3>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="For questions about these Terms and Conditions:" />
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <TranslatedText text="Email:" />{' '}
                                        <a href={`mailto:${TERMS_CONTACT_EMAIL}`} className="text-blue-600 underline">
                                            {TERMS_CONTACT_EMAIL}
                                        </a>
                                    </p>
                                    <p className="text-gray-600 mb-2" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Customer Support:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="We respond to all inquiries within 2 business days." />
                                    </p>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <strong>
                                            <TranslatedText text="Complaints:" />
                                        </strong>
                                        <br />
                                        <TranslatedText text="If you're unsatisfied with our response, you may escalate the dispute through the EU ODR platform or contact your local consumer protection authority." />
                                    </p>
                                    <p className="text-gray-600 mt-4" style={bodyStyle}>
                                        <TranslatedText text="These terms, together with our Privacy Policy, constitute the entire agreement between you and Bazzingo." />
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}><TranslatedText text="1. User Agreement" /></h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." />
                                    </p>
                                </div>
                                <div style={sectionStyle}>
                                    <h3 className="text-gray-900" style={headingStyle}><TranslatedText text="2. Platform Usage" /></h3>
                                    <p className="text-gray-600" style={bodyStyle}>
                                        <TranslatedText text="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." />
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default TermsOfUse;
