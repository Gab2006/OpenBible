import json

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze():
    cei = load_json('public/bible_cei.json')
    tilc = load_json('public/bible_tilc.json')
    
    cei_books = set(cei.keys())
    tilc_books = set(tilc.keys())
    
    print(f"Books in CEI: {len(cei_books)}")
    print(f"Books in TILC: {len(tilc_books)}")
    
    if cei_books != tilc_books:
        print(f"Missing books in TILC: {cei_books - tilc_books}")
        print(f"Extra books in TILC: {tilc_books - cei_books}")
        
    total_cei_verses = 0
    total_tilc_verses = 0
    
    missing_chapters = []
    verse_discrepancies = []
    
    for book in cei_books.intersection(tilc_books):
        cei_chapters = set(cei[book].keys())
        tilc_chapters = set(tilc[book].keys())
        
        if cei_chapters != tilc_chapters:
            missing_chapters.append((book, cei_chapters - tilc_chapters, tilc_chapters - cei_chapters))
            
        for chapter in cei_chapters.intersection(tilc_chapters):
            cei_v = {v['verse'] for v in cei[book][chapter]}
            tilc_v = {v['verse'] for v in tilc[book][chapter]}
            
            total_cei_verses += len(cei_v)
            total_tilc_verses += len(tilc_v)
            
            # Solo notiamo le differenze grandi (>2 versetti per capitolo) per non intasare,
            # oppure le contiamo e basta.
            if len(cei_v) != len(tilc_v):
                verse_discrepancies.append((book, chapter, len(cei_v), len(tilc_v)))
                
    print(f"\nTotal Verses CEI: {total_cei_verses}")
    print(f"Total Verses TILC: {total_tilc_verses}")
    
    if missing_chapters:
        print("\nMissing Chapters:")
        for m in missing_chapters:
            print(f"Book {m[0]} - Missing in TILC: {m[1]} | Extra in TILC: {m[2]}")
    else:
        print("\nNo chapters missing!")
        
    print(f"\nChapters with different verse counts: {len(verse_discrepancies)}")
    
    # Raggruppiamo i versetti raggruppati in TILC
    # Abbiamo parsato "17-18" come 17 e basta, quindi TILC avrà 1 versetto al posto di 2.
    diff = total_cei_verses - total_tilc_verses
    print(f"\nExpected difference in total verses: {diff}")
    
if __name__ == '__main__':
    analyze()
