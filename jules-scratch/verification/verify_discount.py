
import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in to the application
    page.goto("http://localhost:3000/login")
    page.wait_for_selector('input[name="email"]')
    page.locator('input[name="email"]').fill("clevertonruppenthal1@gmail.com")
    page.locator('input[name="password"]').fill("123456")
    page.get_by_role("button", name="Entrar").click()

    # Navigate to the quote
    page.goto("http://localhost:3000/companies/f28afd2f-0a27-4fd8-871b-93121cf1d828/quotes/5aeaa02f-a039-487c-9876-77ced0ba0e45/edit")
    page.wait_for_selector('select[name="discount_type"]')

    # Change the discount type to "percentage" and set a value
    page.locator('select[name="discount_type"]').select_option("percentage")
    page.locator('input[name="discount_value"]').fill("10")
    page.get_by_role("button", name="Salvar").click()

    # Take a screenshot to verify the change
    page.screenshot(path="jules-scratch/verification/verification.png")

    # Close the browser
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
