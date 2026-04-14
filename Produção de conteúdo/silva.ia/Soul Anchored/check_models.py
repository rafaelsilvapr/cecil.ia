import google.generativeai as genai
genai.configure(api_key="AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
