#!/usr/bin/env python3
"""
Simplify GPX files for web display while preserving download originals.
Reduces file size by ~80% while maintaining route fidelity.
"""

import xml.etree.ElementTree as ET
import os
import sys

def simplify_gpx(input_file, output_file, target_points=2000):
    """
    Simplify a GPX file by reducing the number of trackpoints.

    Args:
        input_file: Path to original GPX file
        output_file: Path to simplified output file
        target_points: Target number of points (default 2000)
    """
    # Parse the GPX file
    tree = ET.parse(input_file)
    root = tree.getroot()

    # Define the GPX namespace
    ns = {'gpx': 'http://www.topografix.com/GPX/1/1'}

    # Find all trackpoints
    trackpoints = []
    for trkpt in root.findall('.//gpx:trkpt', ns):
        trackpoints.append(trkpt)

    original_count = len(trackpoints)

    if original_count <= target_points:
        # Already small enough, just copy
        tree.write(output_file, encoding='utf-8', xml_declaration=True)
        return original_count, original_count

    # Calculate skip factor
    skip = max(1, original_count // target_points)

    # Find parent track segment
    for trkseg in root.findall('.//gpx:trkseg', ns):
        # Get all trackpoints in this segment
        trkpts = list(trkseg.findall('gpx:trkpt', ns))

        if not trkpts:
            continue

        # Keep first point, every Nth point, and last point
        simplified = [trkpts[0]]  # Always keep first

        for i in range(skip, len(trkpts) - 1, skip):
            simplified.append(trkpts[i])

        if trkpts[-1] not in simplified:
            simplified.append(trkpts[-1])  # Always keep last

        # Remove all trackpoints from segment
        for trkpt in trkpts:
            trkseg.remove(trkpt)

        # Add simplified trackpoints back
        for trkpt in simplified:
            trkseg.append(trkpt)

    # Write simplified GPX
    tree.write(output_file, encoding='utf-8', xml_declaration=True)

    new_count = len(simplified)
    return original_count, new_count

def main():
    routes_dir = '/mnt/c/Users/photo/Documents/mallorca-cycle-shuttle/static/routes'

    gpx_files = [
        'portandratx-pollenca-vanilla.gpx',
        'portandratx-pollenca-via-caimari.gpx',
        'portandratx-pollenca-portvalldemossa.gpx',
        'portandratx-pollenca-valldemossa-sacalobra.gpx',
        'portandratx-pollenca-big-daddy.gpx',
        'portpollenca-portandratx-vanilla.gpx',
        'portpollenca-portandratx-canonge-valldemossa.gpx',
        'portpollenca-portandratx-puigpunyent.gpx',
        'portpollenca-portandratx-big-daddy.gpx'
    ]

    print("Simplifying GPX files for web display...\n")

    total_original_size = 0
    total_simplified_size = 0

    for filename in gpx_files:
        input_path = os.path.join(routes_dir, filename)
        output_filename = filename.replace('.gpx', '-web.gpx')
        output_path = os.path.join(routes_dir, output_filename)

        if not os.path.exists(input_path):
            print(f"⚠️  Skipping {filename} - file not found")
            continue

        try:
            original_count, new_count = simplify_gpx(input_path, output_path, target_points=2000)

            # Get file sizes
            original_size = os.path.getsize(input_path)
            simplified_size = os.path.getsize(output_path)

            total_original_size += original_size
            total_simplified_size += simplified_size

            reduction = (1 - simplified_size / original_size) * 100

            print(f"✅ {filename}")
            print(f"   Points: {original_count:,} → {new_count:,} ({new_count/original_count*100:.1f}%)")
            print(f"   Size: {original_size/1024:.0f}KB → {simplified_size/1024:.0f}KB ({reduction:.1f}% reduction)")
            print()

        except Exception as e:
            print(f"❌ Error processing {filename}: {e}\n")

    # Summary
    total_reduction = (1 - total_simplified_size / total_original_size) * 100
    print("=" * 60)
    print(f"Total original size: {total_original_size/1024/1024:.2f}MB")
    print(f"Total simplified size: {total_simplified_size/1024/1024:.2f}MB")
    print(f"Total reduction: {total_reduction:.1f}%")
    print(f"Savings: {(total_original_size - total_simplified_size)/1024/1024:.2f}MB")

if __name__ == '__main__':
    main()
