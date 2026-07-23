import os
import re

controller_dir = "."
files = [f for f in os.listdir(controller_dir) if f.endswith(".java")]

for f in files:
    with open(f, "r") as file:
        content = file.read()
        
    class_level_auth = bool(re.search(r'@PreAuthorize[^\n]*\n(?:@[^\n]*\n)*public class', content))
    
    if class_level_auth:
        continue # class level is fully covered
        
    # If no class level auth, check every RequestMapping/GetMapping/PostMapping/PutMapping/DeleteMapping method
    method_pattern = r'(@(?:Get|Post|Put|Delete|Patch|Request)Mapping[^\n]*)\n(?:\s*@[^\n]*\n)*\s*public (?:<[^>]+>\s+)?[\w\<\>\[\]\?]+\s+(\w+)\s*\('
    
    methods = list(re.finditer(method_pattern, content))
    
    unprotected_methods = []
    for m in methods:
        matched_text = m.group(0)
        # Check if @PreAuthorize is inside the annotations block (between @Mapping and public)
        # Also check preceding just in case it was above @Mapping
        start_idx = m.start()
        preceding = content[:start_idx].rsplit("}", 1)[-1] 
        if "@PreAuthorize" not in preceding and "@PreAuthorize" not in matched_text:
            unprotected_methods.append(m.group(2))
            
    if unprotected_methods:
        print(f"{f} has unprotected methods: {unprotected_methods}")

print("Done checking.")
