import os
import re

def replace_currency(content):
    # Replacements:
    # 1. >${ -> >₹{
    content = content.replace(">${", ">₹{")
    # 2. >$ -> >₹ (where it's literal string >$50,000)
    content = re.sub(r">\$(?=\d)", ">₹", content)
    # 3. space $ -> space ₹ (like Under $50,000)
    content = re.sub(r" \$(?=\d)", " ₹", content)
    # 4. -$ -> -₹
    content = re.sub(r"-\$(?=\d|\{)", "-₹", content)
    # 5. +$ -> +₹
    content = re.sub(r"\+\$(?=\d|\{)", "+₹", content)
    # 6. "• $" -> "• ₹"
    content = content.replace("• $", "• ₹")
    # 7. "$ " -> "₹ " (Wait, no, maybe not)
    # 8. "${" -> "₹{" IF IT'S JSX NOT TEMPLATE. Wait! In backticks, it is `${`. In tags, it's `${` or inside parens? 
    # Let's target specific files where we know they exist.
    return content

for root, _, files in os.walk("src"):
    for file in files:
        if file.endswith((".tsx", ".ts")):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                
            new_content = replace_currency(content)
            
            # Special case for Payroll.tsx where we have `${response` which is literal dollar inside JSX text
            if "staff/Payroll.tsx" in path or "admin/Payroll.tsx" in path or "admin/AdminDashboard.tsx" in path or "staff/Reports.tsx" in path:
                # careful replacement of ^\s*\$\{ to ^\s*₹\{
                lines = new_content.split("\n")
                for i, line in enumerate(lines):
                    if "${" in line and not "`" in line and "=>" not in line and "href" not in line and "mailto" not in line:
                        # if it's outside template literal, replace ${ with ₹{
                        lines[i] = line.replace("${", "₹{")
                new_content = "\n".join(lines)
                
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {path}")
