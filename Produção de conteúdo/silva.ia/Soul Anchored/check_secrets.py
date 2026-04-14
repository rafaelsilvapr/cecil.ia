import streamlit as st
try:
    print(f"Keys in st.secrets: {list(st.secrets.keys())}")
except Exception as e:
    print(f"Error accessing st.secrets: {e}")
