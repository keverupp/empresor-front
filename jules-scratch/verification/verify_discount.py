
import re
from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in to the application
    page.goto("http://localhost:3001/login")
    page.wait_for_selector('#email')
    page.locator('#email').fill("clevertonruppenthal1@gmail.com")
    page.locator('#password').fill("123456")
    page.get_by_role("button", name="Entrar").click()

    # Navigate to the quote and wait for the page to be ready
    page.goto("http://localhost:3001/companies/f28afd2f-0a27-4fd8-871b-93121cf1d828/quotes/5aeaa02f-a039-487c-9876-77ced0ba0e45/edit")
    page.wait_for_load_state("networkidle", timeout=60000)
    time.sleep(2) # Add a small delay

    # Check that the discount value is 10
    discount_input = page.get_by_label("Valor do Desconto")
    expect(discount_input).to_have_value("10")

    # Take a screenshot to verify the change
    page.screenshot(path="jules-scratch/verification/verification.png")

    # Close the browser
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
