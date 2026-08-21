import urllib.request
import urllib.parse
import re
import json
import os
import sys
import time
from html import unescape
from concurrent.futures import ThreadPoolExecutor, as_completed

BOOKS = [
    {"id": "GEN", "name": "Genesi", "abbrev": "gn", "chapters": 50},
    {"id": "EXO", "name": "Esodo", "abbrev": "es", "chapters": 40},
    {"id": "LEV", "name": "Levitico", "abbrev": "lv", "chapters": 27},
    {"id": "NUM", "name": "Numeri", "abbrev": "nm", "chapters": 36},
    {"id": "DEU", "name": "Deuteronomio", "abbrev": "dt", "chapters": 34},
    {"id": "JOS", "name": "Giosuè", "abbrev": "gs", "chapters": 24},
    {"id": "JDG", "name": "Giudici", "abbrev": "gdc", "chapters": 21},
    {"id": "RUT", "name": "Rut", "abbrev": "rut", "chapters": 4},
    {"id": "1SA", "name": "1 Samuele", "abbrev": "1sam", "chapters": 31},
    {"id": "2SA", "name": "2 Samuele", "abbrev": "2sam", "chapters": 24},
    {"id": "1KI", "name": "1 Re", "abbrev": "1re", "chapters": 22},
    {"id": "2KI", "name": "2 Re", "abbrev": "2re", "chapters": 25},
    {"id": "1CH", "name": "1 Cronache", "abbrev": "1cr", "chapters": 29},
    {"id": "2CH", "name": "2 Cronache", "abbrev": "2cr", "chapters": 36},
    {"id": "EZR", "name": "Esdra", "abbrev": "esd", "chapters": 10},
    {"id": "NEH", "name": "Neemia", "abbrev": "ne", "chapters": 13},
    {"id": "EST", "name": "Ester", "abbrev": "est", "chapters": 10},
    {"id": "JOB", "name": "Giobbe", "abbrev": "gb", "chapters": 42},
    {"id": "PSA", "name": "Salmi", "abbrev": "sal", "chapters": 150},
    {"id": "PRO", "name": "Proverbi", "abbrev": "prv", "chapters": 31},
    {"id": "ECC", "name": "Ecclesiaste", "abbrev": "qo", "chapters": 12},
    {"id": "SNG", "name": "Cantico dei Cantici", "abbrev": "cant", "chapters": 8},
    {"id": "ISA", "name": "Isaia", "abbrev": "is", "chapters": 66},
    {"id": "JER", "name": "Geremia", "abbrev": "ger", "chapters": 52},
    {"id": "LAM", "name": "Lamentazioni", "abbrev": "lam", "chapters": 5},
    {"id": "EZK", "name": "Ezechiele", "abbrev": "ez", "chapters": 48},
    {"id": "DAN", "name": "Daniele", "abbrev": "dan", "chapters": 12},
    {"id": "HOS", "name": "Osea", "abbrev": "os", "chapters": 14},
    {"id": "JOL", "name": "Gioele", "abbrev": "gl", "chapters": 3},
    {"id": "AMO", "name": "Amos", "abbrev": "am", "chapters": 9},
    {"id": "OBA", "name": "Abdia", "abbrev": "abd", "chapters": 1},
    {"id": "JON", "name": "Giona", "abbrev": "gio", "chapters": 4},
    {"id": "MIC", "name": "Michea", "abbrev": "mi", "chapters": 7},
    {"id": "NAM", "name": "Naum", "abbrev": "na", "chapters": 3},
    {"id": "HAB", "name": "Abacuc", "abbrev": "abac", "chapters": 3},
    {"id": "ZEP", "name": "Sofonia", "abbrev": "so", "chapters": 3},
    {"id": "HAG", "name": "Aggeo", "abbrev": "ag", "chapters": 2},
    {"id": "ZEC", "name": "Zaccaria", "abbrev": "za", "chapters": 14},
    {"id": "MAL", "name": "Malachia", "abbrev": "ml", "chapters": 3},
    {"id": "MAT", "name": "Matteo", "abbrev": "mt", "chapters": 28},
    {"id": "MRK", "name": "Marco", "abbrev": "mc", "chapters": 16},
    {"id": "LUK", "name": "Luca", "abbrev": "lc", "chapters": 24},
    {"id": "JHN", "name": "Giovanni", "abbrev": "gv", "chapters": 21},
    {"id": "ACT", "name": "Atti degli Apostoli", "abbrev": "at", "chapters": 28},
    {"id": "ROM", "name": "Romani", "abbrev": "rm", "chapters": 16},
    {"id": "1CO", "name": "1 Corinzi", "abbrev": "1cor", "chapters": 16},
    {"id": "2CO", "name": "2 Corinzi", "abbrev": "2cor", "chapters": 13},
    {"id": "GAL", "name": "Galati", "abbrev": "gal", "chapters": 6},
    {"id": "EPH", "name": "Efesini", "abbrev": "ef", "chapters": 6},
    {"id": "PHP", "name": "Filippesi", "abbrev": "fil", "chapters": 4},
    {"id": "COL", "name": "Colossesi", "abbrev": "col", "chapters": 4},
    {"id": "1TH", "name": "1 Tessalonicesi", "abbrev": "1ts", "chapters": 5},
    {"id": "2TH", "name": "2 Tessalonicesi", "abbrev": "2ts", "chapters": 3},
    {"id": "1TI", "name": "1 Timoteo", "abbrev": "1tm", "chapters": 6},
    {"id": "2TI", "name": "2 Timoteo", "abbrev": "2tm", "chapters": 4},
    {"id": "TIT", "name": "Tito", "abbrev": "tt", "chapters": 3},
    {"id": "PHM", "name": "Filemone", "abbrev": "fl", "chapters": 1},
    {"id": "HEB", "name": "Ebrei", "abbrev": "eb", "chapters": 13},
    {"id": "JAS", "name": "Giacomo", "abbrev": "gc", "chapters": 5},
    {"id": "1PE", "name": "1 Pietro", "abbrev": "1pt", "chapters": 5},
    {"id": "2PE", "name": "2 Pietro", "abbrev": "2pt", "chapters": 3},
    {"id": "1JN", "name": "1 Giovanni", "abbrev": "1gv", "chapters": 5},
    {"id": "2JN", "name": "2 Giovanni", "abbrev": "2gv", "chapters": 1},
    {"id": "3JN", "name": "3 Giovanni", "abbrev": "3gv", "chapters": 1},
    {"id": "JUD", "name": "Giuda", "abbrev": "giu", "chapters": 1},
    {"id": "REV", "name": "Apocalisse", "abbrev": "ap", "chapters": 22}
]

def clean_text(html_text):
    text = re.sub(r'<[^>]+>', ' ', html_text)
    text = re.sub(r'\s+', ' ', text)
    text = unescape(text)
    return text.strip()

def fetch_chapter(book_id, abbrev, chapter, cei_verses, retries=3):
    query = f"{abbrev} {chapter}"
    url = f"https://www.lachiesa.it/bibbia.php?ricerca=citazione&Citazione={urllib.parse.quote(query)}&Versione_TILC=2&VersettoOn=1&Cerca=Cerca"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                html = resp.read().decode('utf-8')
            
            match = re.search(r'<div id="testo">(.*?)</div>\s*</td>', html, re.DOTALL | re.IGNORECASE)
            if not match:
                match = re.search(r'<div id="testo">(.*?)</div>\s*<(?:table|/td)', html, re.DOTALL | re.IGNORECASE)
                
            if not match:
                print(f"Warning: No text div found for {book_id} {chapter}")
                return book_id, chapter, []
            
            content = match.group(1)
            content = re.sub(r'<br\s*/?>', ' ', content, flags=re.IGNORECASE)
            content = re.sub(r'<div id="capitolo">\d+</div>', ' ', content, flags=re.IGNORECASE)
            content = re.sub(r'\(Testo TILC\)', ' ', content, flags=re.IGNORECASE)
            
            parts = re.split(r'<sup[^>]*>(.*?)</sup>', content, flags=re.IGNORECASE)
            
            parsed_tilc = {}
            for i in range(1, len(parts), 2):
                v_num_str = parts[i].strip()
                v_text_html = parts[i+1] if i+1 < len(parts) else ""
                
                m = re.search(r'(\d+)(?:\s*-\s*(\d+))?', v_num_str)
                if not m:
                    continue
                start_v = int(m.group(1))
                end_v = int(m.group(2)) if m.group(2) else start_v
                
                verse_text = clean_text(v_text_html)
                verse_text = re.sub(r'\s+([.,;:!?»)\]])', r'\1', verse_text)
                verse_text = re.sub(r'([«(\[])\s+', r'\1', verse_text)
                verse_text = re.sub(r'\s+', ' ', verse_text).strip()
                
                if verse_text:
                    parsed_tilc[start_v] = verse_text
                    for v in range(start_v + 1, end_v + 1):
                        parsed_tilc[v] = "-"
                        
            if not parsed_tilc:
                print(f"Warning: No verses parsed for {book_id} {chapter}")
                return book_id, chapter, []
                
            final_verses = []
            for cei_v in cei_verses:
                v_num = cei_v["verse"]
                text = parsed_tilc.get(v_num, "-")
                final_verses.append({
                    "verse": v_num,
                    "text": text
                })
                
            return book_id, chapter, final_verses
            
        except Exception as e:
            if attempt == retries - 1:
                print(f"Failed fetching {book_id} {chapter} after {retries} attempts: {e}")
            time.sleep(2)

    return book_id, chapter, []

def main():
    force = "--force" in sys.argv
    test_mode = "--test" in sys.argv
    output_path = os.path.join(os.getcwd(), "public", "bible_tilc.json")
    cei_path = os.path.join(os.getcwd(), "public", "bible_cei.json")
    if not os.path.exists(cei_path):
        cei_path = os.path.join(os.getcwd(), "public", "bible.json")
        
    if not os.path.exists(cei_path):
        print("Error: public/bible.json (or bible_cei.json) not found. Need it as a reference for verses.")
        sys.exit(1)
        
    with open(cei_path, "r", encoding="utf-8") as f:
        cei_data = json.load(f)
        
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
    
    books_to_process = BOOKS
    if test_mode:
        print("TEST MODE: Solo Libro di Rut (RUT)")
        books_to_process = [b for b in BOOKS if b["id"] == "RUT"]
        
    for b in books_to_process:
        b_id = b["id"]
        abbrev = b["abbrev"]
        if b_id not in result_data:
            result_data[b_id] = {}
        for ch in range(1, b["chapters"] + 1):
            ch_str = str(ch)
            if ch_str not in result_data[b_id] or not result_data[b_id][ch_str]:
                cei_verses = cei_data.get(b_id, {}).get(ch_str, [])
                if not cei_verses:
                    continue # Skip if CEI doesn't have it either
                all_tasks.append((b_id, abbrev, ch, cei_verses))

    print(f"Total chapters to download: {len(all_tasks)}")
    if not all_tasks:
        print("All chapters already fully downloaded and populated!")
        return

    completed = 0
    failed_chapters = []
    
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {
            executor.submit(fetch_chapter, b_id, abbrev, ch, cei_verses): (b_id, abbrev, ch)
            for b_id, abbrev, ch, cei_verses in all_tasks
        }
        for future in as_completed(futures):
            b_id, ch, verses = future.result()
            if verses:
                result_data[b_id][str(ch)] = verses
            else:
                failed_chapters.append(f"{b_id} {ch}")
            completed += 1
            if completed % 10 == 0 or completed == len(all_tasks):
                print(f"Progress: {completed}/{len(all_tasks)} chapters downloaded.", flush=True)
                
            time.sleep(0.5)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)

    if failed_chapters:
        print(f"\nWarning: {len(failed_chapters)} chapters failed: {', '.join(failed_chapters[:20])}")
    else:
        print(f"\nDownload completed successfully! All {len(all_tasks)} chapters saved.")

    print(f"TILC Bible saved to {output_path}.")

if __name__ == "__main__":
    main()
