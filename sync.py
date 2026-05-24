import os
import json

def sync_projects():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    projects_dir = os.path.join(base_dir, "projects")
    output_file = os.path.join(base_dir, "projects.json")
    
    print("=" * 60)
    print("    PORTFOLIO PROJECT DATABASE SYNC ENGINE (3D ARTIST v2)    ")
    print("=" * 60)
    
    if not os.path.exists(projects_dir):
        print(f"Error: 'projects' directory not found at {projects_dir}")
        print("Creating an empty 'projects' directory...")
        os.makedirs(projects_dir)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)
        return

    project_list = []
    
    subdirs = sorted([d for d in os.listdir(projects_dir) if os.path.isdir(os.path.join(projects_dir, d))])
    
    print(f"Scanning 'projects/' directory. Found {len(subdirs)} subfolders.\n")
    
    for folder_name in subdirs:
        folder_path = os.path.join(projects_dir, folder_name)
        info_file = os.path.join(folder_path, "info.json")
        
        if not os.path.exists(info_file):
            print(f"[-] Skipping folder '{folder_name}': Missing 'info.json'")
            continue
            
        print(f"[+] Processing folder '{folder_name}'...")
        
        try:
            with open(info_file, "r", encoding="utf-8") as f:
                project_data = json.load(f)
        except Exception as e:
            print(f"    [Error] Failed to parse 'info.json' in '{folder_name}': {e}")
            continue
            
        # 1. Look for thumbnail (Prefer webp first, then fallback to jpg/png)
        thumbnail_filename = None
        for ext in [".webp", ".jpg", ".jpeg", ".png"]:
            temp_name = f"thumbnail{ext}"
            if os.path.exists(os.path.join(folder_path, temp_name)):
                thumbnail_filename = temp_name
                break
        
        if not thumbnail_filename:
            # If no explicit thumbnail.webp/jpg exists, look for any image starting with 'thumbnail'
            for file_in_folder in os.listdir(folder_path):
                if file_in_folder.lower().startswith("thumbnail") and file_in_folder.lower().endswith((".webp", ".jpg", ".jpeg", ".png")):
                    thumbnail_filename = file_in_folder
                    break
                    
        # 2. Look for lookdev slide maps (.webp preferred as requested by user)
        lookdev_slides = {}
        maps_to_find = {
            "render": ["render.webp", "render.jpg", "render.png"],
            "wireframe": ["wireframe.webp", "wireframe.jpg", "wireframe.png"],
            "ao": ["ao.webp", "ao.jpg", "ao.png"],
            "basecolor": ["basecolor.webp", "basecolor.jpg", "basecolor.png"],
            "normals": ["normals.webp", "normals.jpg", "normals.png"]
        }
        
        for map_type, possible_filenames in maps_to_find.items():
            for filename in possible_filenames:
                if os.path.exists(os.path.join(folder_path, filename)):
                    lookdev_slides[map_type] = f"projects/{folder_name}/{filename}"
                    break
        
        # 3. Look for Marmoset Toolbag files (.mview)
        mview_filename = None
        mview_html_filename = None
        for file_in_folder in os.listdir(folder_path):
            if file_in_folder.lower().endswith(".mview"):
                mview_filename = file_in_folder
            elif file_in_folder.lower() in ["marmoset.html", "viewer.html"]:
                mview_html_filename = file_in_folder
                
        # 4. Look for GLB 3D model
        model_filename = None
        for file_in_folder in os.listdir(folder_path):
            if file_in_folder.lower().endswith(".glb"):
                model_filename = file_in_folder
                break
                
        # Build optimized project data structure
        project_obj = {
            "id": folder_name,
            "title": project_data.get("title", folder_name.replace("-", " ").title()),
            "category": project_data.get("category", "3D Art"),
            "tools": project_data.get("tools", []),
            "description": project_data.get("description", ""),
            "demoUrl": project_data.get("demoUrl", "#"),
            "thumbnail": f"projects/{folder_name}/{thumbnail_filename}" if thumbnail_filename else "assets/placeholder_thumbnail.jpg",
            "model": f"projects/{folder_name}/{model_filename}" if model_filename else None,
            "mview": f"projects/{folder_name}/{mview_filename}" if mview_filename else None,
            "mviewHtml": f"projects/{folder_name}/{mview_html_filename}" if mview_html_filename else None,
            "slides": lookdev_slides
        }
        
        project_list.append(project_obj)
        print(f"    Added: '{project_obj['title']}'")
        if project_obj['slides']:
            print(f"    ├─ Lookdev slides detected: {list(project_obj['slides'].keys())}")
        if project_obj['mview']:
            print(f"    ├─ Marmoset Viewer Scene (.mview) detected: '{project_obj['mview']}'")
        if project_obj['mviewHtml']:
            print(f"    ├─ Marmoset HTML Wrapper detected: '{project_obj['mviewHtml']}'")
        if project_obj['model']:
            print(f"    └─ 3D Model detected: '{project_obj['model']}'")
            
    # Write to projects.json
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(project_list, f, indent=2, ensure_ascii=False)
        print("\n" + "=" * 60)
        print(f"SUCCESS: Rebuilt dynamic database with Lookdev Studio capabilities at:\n{output_file}")
        print(f"Total active projects: {len(project_list)}")
        print("=" * 60)
    except Exception as e:
        print(f"\nError saving database: {e}")

if __name__ == "__main__":
    sync_projects()
