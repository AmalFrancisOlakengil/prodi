import os
import google.generativeai as genai
from serpapi import GoogleSearch
import json
from dotenv import load_dotenv

load_dotenv()

def init_genai():
    api_key = os.environ.get("GOOGLE_API_KEY", "")
    if api_key:
        genai.configure(api_key=api_key)

def search_products(query: str, site: str = "") -> str:
    """
    Searches the web for products, specs, and reviews. Use this to lookup products across marketplaces.
    """
    search_query = query
    if site:
        search_query += f" site:{site}"
    
    params = {
      "engine": "google",
      "q": search_query,
      "api_key": os.environ.get("SERPAPI_API_KEY", ""),
      "num": 5
    }
    
    search = GoogleSearch(params)
    results = search.get_dict()
    
    shopping_results = results.get("shopping_results", [])
    organic_results = results.get("organic_results", [])
    
    output = []
    if shopping_results:
        for item in shopping_results[:5]:
            output.append({
                "title": item.get("title"),
                "price": item.get("price", ""),
                "rating": item.get("rating", ""),
                "source": item.get("source", ""),
                "link": item.get("product_link") or item.get("link", "")
            })
    else:
        for item in organic_results[:5]:
            output.append({
                "title": item.get("title"),
                "snippet": item.get("snippet", ""),
                "price": item.get("price", ""),
                "rating": item.get("rating", ""),
                "link": item.get("link", "")
            })
            
    return json.dumps(output)

def run_agent(user_query: str) -> str:
    init_genai()
    
    search_data_json = search_products(user_query)
    
    model = genai.GenerativeModel(
        model_name='gemini-2.5-flash',
        system_instruction=(
            "You are an AI Product Purchase Agent.\n"
            "Help the user find the best product by analyzing the provided real-time search data.\n"
            "IMPORTANT FORMATTING RULES:\n"
            "1. DO NOT generate massive or repetitive markdown tables. Keep tables extremely concise.\n"
            "2. Use clean bullet points and clear headings (`##`) to separate products instead of tables where possible.\n"
            "3. MANDATORY CHARTS: You MUST provide text-based horizontal bar charts to visualize numerical comparisons like Price or Rating (e.g., `Rating: \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591 4.0`). Do not skip this.\n"
            "4. MANDATORY LINKS: You MUST include the exact source URL/link for every single product you recommend from the search data so the user can easily buy it.\n"
            "5. Clearly highlight the 'Best Overall Choice' at the end.\n"
            "6. Make sure the output is well structured and properly formatted markdown."
        )
    )
    
    prompt = f"User query: {user_query}\n\nSearch Results:\n{search_data_json}\n\nPlease analyze these search results, compare the options, and recommend the best product. Make sure you plot charts and list the product URLs."
    response = model.generate_content(prompt)
    return response.text
