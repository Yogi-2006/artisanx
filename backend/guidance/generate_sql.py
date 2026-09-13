from workflows import WORKFLOWS

sql = ""

for w in WORKFLOWS:
    sql += f"""
INSERT INTO guidance_workflows (id, workflow_key, title_en, target_role, is_active)
VALUES ('{w['id']}', '{w['name']}', '{w['description'].replace("'", "''")}', '{w['target_role']}', {str(w['is_active']).lower()})
ON CONFLICT (id) DO UPDATE SET workflow_key = EXCLUDED.workflow_key, title_en = EXCLUDED.title_en, target_role = EXCLUDED.target_role, is_active = EXCLUDED.is_active;
"""
    for s in w['steps']:
        # Format strings properly
        cols = ['id', 'workflow_id', 'step_order']
        # generating id since schema doesn't have it in dict, wait, supabase schema has default gen_random_uuid().
        cols_sql = ['workflow_id', 'step_order']
        vals_sql = [f"'{w['id']}'", str(s['step_order'])]
        
        for k, v in s.items():
            if k in ['step_order']:
                continue
            cols_sql.append(k)
            if v is None:
                vals_sql.append("NULL")
            elif isinstance(v, str):
                vals_sql.append(f"'{v.replace(chr(39), chr(39)+chr(39))}'")
            else:
                vals_sql.append(str(v))
        
        sql += f"""
INSERT INTO guidance_steps ({', '.join(cols_sql)})
VALUES ({', '.join(vals_sql)});
"""

with open("seed.sql", "w", encoding="utf-8") as f:
    f.write(sql)
