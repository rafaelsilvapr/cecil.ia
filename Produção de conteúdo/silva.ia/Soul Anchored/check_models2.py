import google.generativeai as genai
genai.configure(api_key="AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980")
try:
    model = genai.GenerativeModel('gemini-2.5-flash')
    res = model.generate_content("Hello")
    print("SUCCESS 2.5:", res.text)
except Exception as e:
    print("FAIL 2.5:", e)
    
try:
    model = genai.GenerativeModel('gemini-1.5-flash-8b')
    res = model.generate_content("Hello")
    print("SUCCESS 1.5-8b:", res.text)
except Exception as e:
    print("FAIL 1.5-8b:", e)
    
try:
    model = genai.GenerativeModel('gemini-1.5-pro')
    res = model.generate_content("Hello")
    print("SUCCESS 1.5-pro:", res.text)
except Exception as e:
    print("FAIL 1.5-pro:", e)
