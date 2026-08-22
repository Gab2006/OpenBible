import urllib.request
import urllib.parse
import re
import json
import os
import sys
import time
from html import unescape
from collections import OrderedDict
from concurrent.futures import ThreadPoolExecutor, as_completed

BOOKS = [
  {"id": "GEN", "name": "Genesi", "chapters": 50},
  {"id": "EXO", "name": "Esodo", "chapters": 40},
  {"id": "LEV", "name": "Levitico", "chapters": 27},
  {"id": "NUM", "name": "Numeri", "chapters": 36},
  {"id": "DEU", "name": "Deuteronomio", "chapters": 34},
  {"id": "JOS", "name": "Giosuè", "chapters": 24},
  {"id": "JDG", "name": "Giudici", "chapters": 21},
  {"id": "RUT", "name": "Rut", "chapters": 4},
  {"id": "1SA", "name": "1 Samuele", "chapters": 31},
  {"id": "2SA", "name": "2 Samuele", "chapters": 24},
  {"id": "1KI", "name": "1 Re", "chapters": 22},
  {"id": "2KI", "name": "2 Re", "chapters": 25},
  {"id": "1CH", "name": "1 Cronache", "chapters": 29},
  {"id": "2CH", "name": "2 Cronache", "chapters": 36},
  {"id": "EZR", "name": "Esdra", "chapters": 10},
  {"id": "NEH", "name": "Neemia", "chapters": 13},
  {"id": "EST", "name": "Ester", "chapters": 10},
  {"id": "JOB", "name": "Giobbe", "chapters": 42},
  {"id": "PSA", "name": "Salmi", "chapters": 150},
  {"id": "PRO", "name": "Proverbi", "chapters": 31},
  {"id": "ECC", "name": "Ecclesiaste", "chapters": 12},
  {"id": "SNG", "name": "Cantico dei Cantici", "chapters": 8},
  {"id": "ISA", "name": "Isaia", "chapters": 66},
  {"id": "JER", "name": "Geremia", "chapters": 52},
  {"id": "LAM", "name": "Lamentazioni", "chapters": 5},
  {"id": "EZK", "name": "Ezechiele", "chapters": 48},
  {"id": "DAN", "name": "Daniele", "chapters": 12},
  {"id": "HOS", "name": "Osea", "chapters": 14},
  {"id": "JOL", "name": "Gioele", "chapters": 3},
  {"id": "AMO", "name": "Amos", "chapters": 9},
  {"id": "OBA", "name": "Abdia", "chapters": 1},
  {"id": "JON", "name": "Giona", "chapters": 4},
  {"id": "MIC", "name": "Michea", "chapters": 7},
  {"id": "NAM", "name": "Naum", "chapters": 3},
  {"id": "HAB", "name": "Abacuc", "chapters": 3},
  {"id": "ZEP", "name": "Sofonia", "chapters": 3},
  {"id": "HAG", "name": "Aggeo", "chapters": 2},
  {"id": "ZEC", "name": "Zaccaria", "chapters": 14},
  {"id": "MAL", "name": "Malachia", "chapters": 3},
  {"id": "MAT", "name": "Matteo", "chapters": 28},
  {"id": "MRK", "name": "Marco", "chapters": 16},
  {"id": "LUK", "name": "Luca", "chapters": 24},
  {"id": "JHN", "name": "Giovanni", "chapters": 21},
  {"id": "ACT", "name": "Atti degli Apostoli", "chapters": 28},
  {"id": "ROM", "name": "Romani", "chapters": 16},
  {"id": "1CO", "name": "1 Corinzi", "chapters": 16},
  {"id": "2CO", "name": "2 Corinzi", "chapters": 13},
  {"id": "GAL", "name": "Galati", "chapters": 6},
  {"id": "EPH", "name": "Efesini", "chapters": 6},
  {"id": "PHP", "name": "Filippesi", "chapters": 4},
  {"id": "COL", "name": "Colossesi", "chapters": 4},
  {"id": "1TH", "name": "1 Tessalonicesi", "chapters": 5},
  {"id": "2TH", "name": "2 Tessalonicesi", "chapters": 3},
  {"id": "1TI", "name": "1 Timoteo", "chapters": 6},
  {"id": "2TI", "name": "2 Timoteo", "chapters": 4},
  {"id": "TIT", "name": "Tito", "chapters": 3},
  {"id": "PHM", "name": "Filemone", "chapters": 1},
  {"id": "HEB", "name": "Ebrei", "chapters": 13},
  {"id": "JAS", "name": "Giacomo", "chapters": 5},
  {"id": "1PE", "name": "1 Pietro", "chapters": 5},
  {"id": "2PE", "name": "2 Pietro", "chapters": 3},
  {"id": "1JN", "name": "1 Giovanni", "chapters": 5},
  {"id": "2JN", "name": "2 Giovanni", "chapters": 1},
  {"id": "3JN", "name": "3 Giovanni", "chapters": 1},
  {"id": "JUD", "name": "Giuda", "chapters": 1},
  {"id": "REV", "name": "Apocalisse", "chapters": 22}
]


def _extract_span_text(span_html):
    """Estrae il testo puro da un <span>, rimuovendo tag interni (sup, i, ecc.)."""
    # Rimuove il tag versenum/chapternum (contiene il numero del versetto, non il testo)
    cleaned = re.sub(r'<sup[^>]*class="[^"]*versenum[^"]*"[^>]*>.*?</sup>', '', span_html, flags=re.DOTALL)
    cleaned = re.sub(r'<span[^>]*class="[^"]*chapternum[^"]*"[^>]*>.*?</span>', '', cleaned, flags=re.DOTALL)
    # Rimuove tutti i tag HTML rimanenti (i, b, br, ecc.) mantenendo il testo
    cleaned = re.sub(r'<[^>]+>', ' ', cleaned)
    cleaned = unescape(cleaned).strip()
    cleaned = re.sub(r'\s+', ' ', cleaned)
    return cleaned


def fetch_chapter(book_id, book_name, chapter, retries=3):
    query_name = book_name
    if book_id == "JOS":
        query_name = "Giosue"
    elif book_id == "ACT":
        query_name = "Atti"

    query = f"{query_name} {chapter}"
    url = f"https://www.biblegateway.com/passage/?search={urllib.parse.quote(query)}&version=CEI"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode('utf-8')

                # Estrae il div con il testo del passaggio
                passage_match = re.search(
                    r'<div\s+class=["\']passage-content[^"\']*["\'][^>]*>(.*?)</div>\s*</div>\s*</div>\s*</div>\s*</div>',
                    html, re.DOTALL
                )
                if not passage_match:
                    # Fallback: cerca il div result-text-style
                    passage_match = re.search(
                        r'<div\s+class="[^"]*result-text-style[^"]*"[^>]*>(.*)',
                        html, re.DOTALL
                    )
                if not passage_match:
                    print(f"Warning: No passage div found for {book_id} {chapter}")
                    return book_id, chapter, []

                passage_html = passage_match.group(1)

                # Rimuove i titoli di sezione (<h3>) che contengono span.text
                # e inquinerebbero il testo dei versetti
                passage_html = re.sub(r'<h3[^>]*>.*?</h3>', '', passage_html, flags=re.DOTALL)

                # Trova tutti i <span class="text BOOK-CH-VS">...</span>
                # L'identificatore del versetto è nel class, es. "text Matt-4-6"
                # Ogni span contiene un frammento di testo del versetto
                # Più span con lo stesso ID vanno concatenati (poesia, citazioni cross-paragraph)
                verse_fragments = OrderedDict()  # verse_id -> [frammenti di testo]
                verse_num_map = {}  # verse_id -> numero versetto

                # Trova i tag di apertura <span class="text XYZ-N-M">
                open_tag_pattern = re.compile(
                    r'<span[^>]*\bclass="([^"]*\btext\s+(\S+-\d+-\d+)\b[^"]*)"[^>]*>'
                )

                for m in open_tag_pattern.finditer(passage_html):
                    full_class = m.group(1)
                    verse_id = m.group(2)  # es. "Matt-4-6"
                    content_start = m.end()

                    # Gestione span annidati: conta aperture/chiusure per trovare il </span> corretto
                    depth = 1
                    pos = content_start
                    while depth > 0 and pos < len(passage_html):
                        next_open = passage_html.find('<span', pos)
                        next_close = passage_html.find('</span>', pos)

                        if next_close == -1:
                            break

                        if next_open != -1 and next_open < next_close:
                            depth += 1
                            pos = next_open + 5  # skip past '<span'
                        else:
                            depth -= 1
                            if depth == 0:
                                inner_html = passage_html[content_start:next_close]
                            pos = next_close + 7  # skip past '</span>'

                    if depth != 0:
                        continue

                    # Determina il numero di versetto dall'ID (ultimo numero dopo l'ultimo '-')
                    verse_num_str = verse_id.rsplit('-', 1)[-1]
                    try:
                        verse_num = int(verse_num_str)
                    except ValueError:
                        continue

                    # Estrae il testo dal frammento
                    fragment_text = _extract_span_text(inner_html)

                    if verse_id not in verse_fragments:
                        verse_fragments[verse_id] = []
                        verse_num_map[verse_id] = verse_num

                    if fragment_text:
                        verse_fragments[verse_id].append(fragment_text)


                # Assembla i versetti finali
                verses = []
                for verse_id, fragments in verse_fragments.items():
                    full_text = ' '.join(fragments)
                    # Pulizia finale: spazi prima di punteggiatura
                    full_text = re.sub(r'\s+([.,;:!?»)\]])', r'\1', full_text)
                    full_text = re.sub(r'([«(\[])\s+', r'\1', full_text)
                    full_text = re.sub(r'\s+', ' ', full_text).strip()

                    if full_text:
                        if full_text in ('.', '].', '...', '[...]') or (len(full_text) < 5 and not any(c.isalpha() for c in full_text)):
                            full_text = "[Versetto raggruppato o omesso in questa traduzione]"
                        verses.append({
                            "verse": verse_num_map[verse_id],
                            "text": full_text
                        })

                if verses:
                    return book_id, chapter, verses
                else:
                    print(f"Warning: No verses parsed for {book_id} {chapter}")
                    return book_id, chapter, []

        except Exception as e:
            if attempt == retries - 1:
                print(f"Failed fetching {book_id} {chapter} after {retries} attempts: {e}")
            time.sleep(1.5)

    return book_id, chapter, []


def main():
    force = "--force" in sys.argv
    output_path = os.path.join(os.getcwd(), "public", "bible.json")
    result_data = {}

    if not force and os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            try:
                result_data = json.load(f)
            except:
                pass

    if force:
        print("Force mode: re-downloading ALL chapters.")
        result_data = {}

    all_tasks = []
    for b in BOOKS:
        b_id = b["id"]
        b_name = b["name"]
        if b_id not in result_data:
            result_data[b_id] = {}
        for ch in range(1, b["chapters"] + 1):
            ch_str = str(ch)
            if ch_str not in result_data[b_id] or not result_data[b_id][ch_str]:
                all_tasks.append((b_id, b_name, ch))

    print(f"Total chapters to download: {len(all_tasks)}")
    if not all_tasks:
        print("All chapters already fully downloaded and populated!")
        return

    completed = 0
    failed_chapters = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(fetch_chapter, b_id, b_name, ch): (b_id, b_name, ch)
            for b_id, b_name, ch in all_tasks
        }
        for future in as_completed(futures):
            b_id, ch, verses = future.result()
            if verses:
                result_data[b_id][str(ch)] = verses
            else:
                failed_chapters.append(f"{b_id} {ch}")
            completed += 1
            if completed % 50 == 0 or completed == len(all_tasks):
                print(f"Progress: {completed}/{len(all_tasks)} chapters downloaded.", flush=True)

    # Salvataggio intermedio prima di eventuale retry
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)

    if failed_chapters:
        print(f"\nWarning: {len(failed_chapters)} chapters failed: {', '.join(failed_chapters[:20])}")
    else:
        print(f"\nDownload completed successfully! All {len(all_tasks)} chapters saved.")

    print(f"CEI Bible saved to {output_path}.")
    
    # Esegui lo script di raggruppamento per allineare i versetti
    import subprocess
    subprocess.run(["python", "scripts/group_verses.py"])


if __name__ == "__main__":
    main()

