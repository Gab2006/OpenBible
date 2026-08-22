import json
import os

def patch_bible(file_path):
    print(f"Patching {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        bible = json.load(f)
        
    count = 0
    for book in bible:
        for chapter in bible[book]:
            for v in bible[book][chapter]:
                text = v['text'].strip()
                if text in ('-', '.', '].', '', '...', '[...]') or (len(text) < 5 and not any(c.isalpha() for c in text)):
                    v['text'] = "[Versetto raggruppato o omesso in questa traduzione]"
                    count += 1
                    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(bible, f, ensure_ascii=False, separators=(',', ':'))
        
    print(f"Patched {count} verses in {file_path}")

patch_bible('public/bible_cei.json')
patch_bible('public/bible_tilc.json')
