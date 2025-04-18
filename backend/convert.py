from pdf2image import convert_from_path
import sys
import os

pdf_path = sys.argv[1]
output_dir = './tmp'
POPPLER_PATH = r"C:\Users\hites\Downloads\Release-24.08.0-0\poppler-24.08.0\Library\bin"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

print(f"Starting conversion for: {pdf_path}")

try:
    images = convert_from_path(pdf_path, dpi=300, poppler_path=POPPLER_PATH)
    for i, image in enumerate(images):
        image.save(f"{output_dir}/page_{i+1}.png", 'PNG')
    print("Conversion successful")
except Exception as e:
    print(f"Python Error: {e}")
    exit(1)  # Force failure so Node sees it
