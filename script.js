let wehenStart = null;
let wehenDaten = [];
let wehenTimerInterval = null;


document.addEventListener('DOMContentLoaded', () => {
    ladeWehenDaten();
});

document.getElementById('wehenButton').addEventListener('click', toggleWehen);
document.getElementById('loeschButton').addEventListener('click', () => {
    if (confirm('Sollen alle Wehendaten wirklich gelÃ¶scht werden?')) {
        loescheWehenDaten();
    }
});

function toggleWehen() {
    const button = document.getElementById('wehenButton');
    const aktiverZaehler = document.getElementById('aktiverZaehler');

    if (!wehenStart) {
        wehenStart = new Date();
        button.textContent = 'Stopp';
        aktiverZaehler.style.display = 'block';
        aktiverZaehler.textContent = 'Wehe gestartet...';

        // Starte den Timer
        if (wehenTimerInterval) {
            clearInterval(wehenTimerInterval);
        }
        wehenTimerInterval = setInterval(() => {
            const dauer = Math.round((new Date() - wehenStart) / 1000);
            aktiverZaehler.textContent = `Wehe lÃ¤uft seit... ${dauer}s`;
        }, 1000);
    } else {
        // Stopp den Timer
        clearInterval(wehenTimerInterval);
        wehenTimerInterval = null;

        const wehenEnde = new Date();
        const wehenDauer = (wehenEnde - wehenStart) / 1000;
        const letzteWehe = wehenDaten[wehenDaten.length - 1];
        const pauseZwischenWehen = letzteWehe ? (wehenStart - new Date(letzteWehe.ende)) / 1000 : 0;

        wehenDaten.push({
            start: wehenStart.toISOString(),
            ende: wehenEnde.toISOString(),
            dauer: wehenDauer,
            pause: pauseZwischenWehen
        });

        speichereWehenDaten();
        aktualisiereTabelle();

        button.textContent = 'Start';
        aktiverZaehler.style.display = 'none';
        wehenStart = null;
    }
}


function speichereWehenDaten() {
    localStorage.setItem('wehenDaten', JSON.stringify(wehenDaten));
}

function ladeWehenDaten() {
    const gespeicherteDaten = localStorage.getItem('wehenDaten');
    if (gespeicherteDaten) {
        wehenDaten = JSON.parse(gespeicherteDaten);
        aktualisiereTabelle();
    }
}

function loescheWehenDaten() {
    localStorage.removeItem('wehenDaten');
    wehenDaten = [];
    aktualisiereTabelle();
}

function aktualisiereTabelle() {
    const tabelleBody = document.getElementById('wehenTabelle').getElementsByTagName('tbody')[0];
    tabelleBody.innerHTML = '';
    wehenDaten.forEach((daten, index) => {
        fÃ¼geWeheZurTabelleHinzu(index + 1, daten);
    });
    aktualisiereDurchschnitte();
}

function fÃ¼geWeheZurTabelleHinzu(nummer, daten) {
    let tabelle = document.getElementById('wehenTabelle').getElementsByTagName('tbody')[0];
    let zeile = tabelle.insertRow(-1);
    let nummerZelle = zeile.insertCell(0);
    let startZelle = zeile.insertCell(1);
    let endeZelle = zeile.insertCell(2);
    let dauerZelle = zeile.insertCell(3);
    let pauseZelle = zeile.insertCell(4);

    nummerZelle.textContent = nummer;
    startZelle.textContent = formatiereDatumZeit(new Date(daten.start));
    endeZelle.textContent = formatiereDatumZeit(new Date(daten.ende));
    dauerZelle.textContent = formatiereZeit(daten.dauer);
    pauseZelle.textContent = formatiereZeit(daten.pause);
}

function aktualisiereDurchschnitte() {
    const jetzt = new Date();
    const eineStundeZurÃ¼ck = new Date(jetzt.getTime() - 60 * 60 * 1000);
    const wehenLetzteStunde = wehenDaten.filter(daten => new Date(daten.start) >= eineStundeZurÃ¼ck);

    const durchschnittDauer = wehenDaten.reduce((acc, curr) => acc + curr.dauer, 0) / wehenDaten.length;
    const durchschnittPause = wehenDaten.reduce((acc, curr) => acc + curr.pause, 0) / wehenDaten.length;
    const durchschnittDauerLetzteStunde = wehenLetzteStunde.reduce((acc, curr) => acc + curr.dauer, 0) / wehenLetzteStunde.length || 0;
    const durchschnittPauseLetzteStunde = wehenLetzteStunde.length > 1 ? wehenLetzteStunde.slice(1).reduce((acc, curr, i) => acc + (new Date(curr.start) - new Date(wehenLetzteStunde[i].ende)) / 1000, 0) / (wehenLetzteStunde.length - 1) : 0;

    document.getElementById('durchschnittDauer').textContent = `Ã˜ Dauer: ${formatiereZeit(durchschnittDauer)}`;
    document.getElementById('durchschnittAbstand').textContent = `Ã˜ Abstand: ${formatiereZeit(durchschnittPause)}`;
    document.getElementById('durchschnittDauerLetzteStunde').textContent = `Ã˜ Dauer letzte Stunde: ${formatiereZeit(durchschnittDauerLetzteStunde)}`;
    document.getElementById('durchschnittPauseLetzteStunde').textContent = `Ã˜ Abstand letzte Stunde: ${formatiereZeit(durchschnittPauseLetzteStunde)}`;
}

function formatiereZeit(sekunden) {
    const gerundeteSekunden = Math.round(sekunden);
    const minuten = Math.floor(gerundeteSekunden / 60);
    const restSekunden = gerundeteSekunden % 60;
    return minuten > 0 ? `${minuten}m ${restSekunden}s` : `${restSekunden}s`;
}

function formatiereDatumZeit(datum) {
    const stunden = datum.getHours().toString().padStart(2, '0');
    const minuten = datum.getMinutes().toString().padStart(2, '0');
    const sekunden = datum.getSeconds().toString().padStart(2, '0');
    return `${stunden}:${minuten}:${sekunden}`;
}