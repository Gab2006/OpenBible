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
  {"id": "MAL", "name": "Malachia", "chapters": 3}, # MAL has 3 chapters in CEI
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

def fetch_chapter(book_id, book_name, chapter, retries=3):
    query_name = book_name
    if book_id == "JOS":
        query_name = "Giosue"  # Bible Gateway CEI doesn't like the accent
    elif book_id == "ACT":
        query_name = "Atti"

    query = f"{query_name} {chapter}"
    url = f"https://www.biblegateway.com/passage/?search={urllib.parse.quote(query)}&version=CEI"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                html = resp.read().decode('utf-8')
                verses = []
                
                matches = re.findall(r'<(sup[^>]*class="[^"]*versenum[^"]*"[^>]*|span[^>]*class="[^"]*chapternum[^"]*"[^>]*)>(\d+).*?<\/(?:sup|span)>(.*?)(?=(?:<(?:sup[^>]*class="[^"]*versenum[^"]*"[^>]*|span[^>]*class="[^"]*chapternum[^"]*"[^>]*)>|<\/div>|<\/p>))', html, re.DOTALL)
                
                for tag, num, text in matches:
                    vnum = 1 if "chapternum" in tag else int(num)
                    clean = re.sub(r'<[^>]+>', ' ', text)
                    clean = unescape(clean).strip()
                    clean = re.sub(r'\s+', ' ', clean)
                    if clean:
                        verses.append({"verse": vnum, "text": clean})
                        
                if verses:
                    return book_id, chapter, verses
                else:
                    print(f"Warning: No verses parsed for {book_id} {chapter}")
                    return book_id, chapter, []
        except Exception as e:
            if attempt == retries - 1:
                print(f"Failed fetching {book_id} {chapter} after {retries} attempts: {e}")
            time.sleep(1)
            
    return book_id, chapter, []

def main():
    output_path = os.path.join(os.getcwd(), "public", "bible.json")
    result_data = {}
    
    if os.path.exists(output_path):
        with open(output_path, "r", encoding="utf-8") as f:
            try:
                result_data = json.load(f)
            except:
                pass

    missing_tasks = []
    for b in BOOKS:
        b_id = b["id"]
        b_name = b["name"]
        if b_id not in result_data:
            result_data[b_id] = {}
        for ch in range(1, b["chapters"] + 1):
            ch_str = str(ch)
            if ch_str not in result_data[b_id] or not result_data[b_id][ch_str]:
                missing_tasks.append((b_id, b_name, ch))
                
    print(f"Total chapters to download/re-download: {len(missing_tasks)}")
    if not missing_tasks:
        print("All chapters already fully downloaded and populated!")
        return

    completed = 0
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(fetch_chapter, b_id, b_name, ch) for b_id, b_name, ch in missing_tasks]
        for future in as_completed(futures):
            b_id, ch, verses = future.result()
            if verses:
                result_data[b_id][str(ch)] = verses
            completed += 1
            if completed % 50 == 0 or completed == len(missing_tasks):
                print(f"Progress: {completed}/{len(missing_tasks)} chapters downloaded.", flush=True)
                
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result_data, f, ensure_ascii=False, indent=2)
        
    print(f"Download completed! CEI Bible saved to {output_path}.")

if __name__ == "__main__":
    main()
