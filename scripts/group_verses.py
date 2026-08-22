import json
import os
import re

PLACEHOLDER = "[Versetto raggruppato o omesso in questa traduzione]"

def is_missing(text):
    text = text.strip()
    return text == PLACEHOLDER or text in ('-', '.', '].', '', '...', '[...]') or (len(text) < 5 and not any(c.isalpha() for c in text))

def remove_prefix(text):
    return re.sub(r'^\[\d+-\d+\]\s*', '', text)

def group_verses():
    cei_path = os.path.join('public', 'bible_cei.json')
    tilc_path = os.path.join('public', 'bible_tilc.json')
    
    with open(cei_path, 'r', encoding='utf-8') as f:
        cei = json.load(f)
    with open(tilc_path, 'r', encoding='utf-8') as f:
        tilc = json.load(f)
        
    for book in cei:
        if book not in tilc:
            continue
        for chapter in cei[book]:
            if chapter not in tilc[book]:
                continue
                
            cei_verses = cei[book][chapter]
            tilc_verses = tilc[book][chapter]
            
            # Map verse numbers to text for easy access
            cei_map = {v['verse']: v for v in cei_verses}
            tilc_map = {v['verse']: v for v in tilc_verses}
            
            all_verse_nums = sorted(set(list(cei_map.keys()) + list(tilc_map.keys())))
            
            current_base = None
            group_end = None
            
            for v_num in all_verse_nums:
                c_v = cei_map.get(v_num)
                t_v = tilc_map.get(v_num)
                
                if not c_v or not t_v:
                    continue
                    
                c_missing = is_missing(c_v['text'])
                t_missing = is_missing(t_v['text'])
                
                if c_missing or t_missing:
                    # This verse is missing in at least one translation
                    if current_base is not None:
                        group_end = v_num
                        
                        # Append text if it was not missing in one of them
                        if not c_missing:
                            cei_map[current_base]['text'] += " " + remove_prefix(c_v['text'])
                        if not t_missing:
                            tilc_map[current_base]['text'] += " " + remove_prefix(t_v['text'])
                            
                        # Hide the current verse
                        c_v['text'] = ""
                        t_v['text'] = ""
                        
                        # Update the displayVerse field
                        display = f"{current_base}-{group_end}"
                        cei_base_text = remove_prefix(cei_map[current_base]['text'])
                        tilc_base_text = remove_prefix(tilc_map[current_base]['text'])
                        
                        cei_map[current_base]['text'] = cei_base_text
                        tilc_map[current_base]['text'] = tilc_base_text
                        cei_map[current_base]['displayVerse'] = display
                        tilc_map[current_base]['displayVerse'] = display
                else:
                    # Both present, start new base
                    current_base = v_num
                    group_end = v_num

    with open(cei_path, 'w', encoding='utf-8') as f:
        json.dump(cei, f, ensure_ascii=False, separators=(',', ':'))
        
    with open(tilc_path, 'w', encoding='utf-8') as f:
        json.dump(tilc, f, ensure_ascii=False, separators=(',', ':'))
        
    print("Verses successfully grouped and aligned.")

if __name__ == "__main__":
    group_verses()
