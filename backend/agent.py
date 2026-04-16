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

def search_products(query: str, site: str = "") -> list:
    """
    Searches the web for products, specs, and reviews.
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
                "link": item.get("product_link") or item.get("link", ""),
                "thumbnail": item.get("thumbnail")
            })
    else:
        for item in organic_results[:5]:
            output.append({
                "title": item.get("title"),
                "snippet": item.get("snippet", ""),
                "price": item.get("price", ""),
                "rating": item.get("rating", ""),
                "link": item.get("link", ""),
                "thumbnail": item.get("thumbnail")
            })
            
    return output

def search_reviews(product_name: str) -> str:
    """
    Searches specifically for reviews and sentiment of a product.
    """
    params = {
      "engine": "google",
      "q": f"{product_name} reviews pros and cons sentiment",
      "api_key": os.environ.get("SERPAPI_API_KEY", ""),
      "num": 3
    }
    search = GoogleSearch(params)
    results = search.get_dict()
    organic = results.get("organic_results", [])
    review_snippets = [f"- {r.get('snippet')}" for r in organic]
    return "\n".join(review_snippets)

def run_agent(user_query: str) -> dict:
    init_genai()
    
    products = search_products(user_query)
    
    # Enrich top 3 products with review snippets
    enriched_data = []
    for p in products[:3]:
        reviews = search_reviews(p['title'])
        p['reviews_summary'] = reviews
        enriched_data.append(p)
    
    search_data_json = json.dumps(enriched_data, indent=2)
    
    model = genai.GenerativeModel(
        model_name='gemini-2.0-flash', # Using a more modern model if available, otherwise flash is fine
        system_instruction=(
            "You are an AI Product Purchase Agent.\n"
            "Help the user find the best product by analyzing the provided real-time search data and review snippets.\n"
            "PERFORM SENTIMENT ANALYSIS: Analyze the review snippets provided for each product. Summarize the overall sentiment (Positive/Negative/Mixed) and list key pros and cons.\n"
            "IMPORTANT FORMATTING RULES:\n"
            "1. DO NOT generate massive or repetitive markdown tables. Keep tables extremely concise.\n"
            "2. Use clean bullet points and clear headings (`##`) to separate products.\n"
            "3. MANDATORY CHARTS: Use text-based horizontal bar charts to visualize Price or Rating (e.g., `Rating: \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591 4.0`).\n"
            "4. MANDATORY LINKS: Include the exact source URL/link for every single product.\n"
            "5. Clearly highlight the 'Best Overall Choice' at the end with a justification based on sentiment and value.\n"
            "6. Make sure the output is well structured properly formatted markdown."
        )
    )
    
    prompt = f"User query: {user_query}\n\nSearch Results with Review Snippets:\n{search_data_json}\n\nPlease analyze these results, perform sentiment analysis, compare the options, and recommend the best product. Include charts and links."
    response = model.generate_content(prompt)
    
    return {
        "markdown": response.text,
        "products": products
    }
