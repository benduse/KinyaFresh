import os
import shutil
import argparse
from typing import Tuple

def move_m4a_files(folder: str = ".", archive_name: str = "m4a_originals",
                   recursive: bool = False, dry_run: bool = False) -> int:
    folder = os.path.abspath(folder)
    if not os.path.isdir(folder):
        print(f"❌ Not a directory: {folder}")
        return 0

    archive_folder = os.path.join(folder, archive_name)
    os.makedirs(archive_folder, exist_ok=True)

    moved = 0

    def _move(source_path: str) -> Tuple[bool, str]:
        filename = os.path.basename(source_path)
        dest = os.path.join(archive_folder, filename)
        # avoid overwrite collisions
        if os.path.exists(dest):
            base, ext = os.path.splitext(filename)
            i = 1
            while True:
                candidate = f"{base}_{i}{ext}"
                candidate_dest = os.path.join(archive_folder, candidate)
                if not os.path.exists(candidate_dest):
                    dest = candidate_dest
                    break
                i += 1
        if dry_run:
            return True, f"DRY RUN: {source_path} -> {dest}"
        try:
            shutil.move(source_path, dest)
            return True, f"📦 Moved: {source_path} -> {dest}"
        except Exception as e:
            return False, f"❌ Failed to move {source_path}: {e}"

    if recursive:
        for dirpath, _, filenames in os.walk(folder):
            # skip the archive folder itself
            if os.path.commonpath([archive_folder, dirpath]) == archive_folder:
                continue
            for fn in filenames:
                if fn.lower().endswith(".m4a"):
                    src = os.path.join(dirpath, fn)
                    ok, msg = _move(src)
                    print(msg)
                    if ok and not dry_run:
                        moved += 1
                    elif ok and dry_run:
                        moved += 1
    else:
        try:
            for fn in os.listdir(folder):
                if fn.lower().endswith(".m4a"):
                    src = os.path.join(folder, fn)
                    ok, msg = _move(src)
                    print(msg)
                    if ok and not dry_run:
                        moved += 1
                    elif ok and dry_run:
                        moved += 1
        except Exception as e:
            print(f"❌ Error reading directory {folder}: {e}")
            return moved

    print(f"\nDone. {moved} file(s) moved{' (dry run)' if dry_run else ''}.")
    return moved


def main():
    parser = argparse.ArgumentParser(description="Move .m4a files into an archive folder.")
    parser.add_argument("folder", nargs="?", default=".", help="Folder to scan (default: current directory)")
    parser.add_argument("-r", "--recursive", action="store_true", help="Search recursively")
    parser.add_argument("-n", "--dry-run", action="store_true", help="Show actions without moving")
    args = parser.parse_args()

    move_m4a_files(folder=args.folder, recursive=args.recursive, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
