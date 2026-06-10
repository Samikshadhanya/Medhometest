import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test():
    options = webdriver.ChromeOptions()
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 5)
    
    try:
        driver.get("https://medhome-81dq.vercel.app/signin")
        wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Continue as guest')]"))).click()
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Guest Setup')]")))
        
        driver.find_element(By.XPATH, "//input[@placeholder='John Doe']").send_keys("Test")
        driver.find_element(By.XPATH, "//button[contains(text(), 'Enter as Guest')]").click()
        wait.until(EC.url_contains("/dashboard"))
        print("At Dashboard")
        time.sleep(2)
        
        # Now click Inventory
        nav_link = wait.until(EC.element_to_be_clickable((By.XPATH, "//nav//a[@href='/inventory']")))
        driver.execute_script("arguments[0].click();", nav_link)
        print("Clicked Inventory")
        time.sleep(2)
        
        print("Current URL:", driver.current_url)
        print("Page source snippet:", driver.page_source[1000:2000])
        
        h1 = wait.until(EC.presence_of_element_located((By.XPATH, "//h1")))
        print("H1 found:", h1.text)
        
    except Exception as e:
        print("Error:", type(e), e)
    finally:
        driver.quit()

if __name__ == "__main__":
    test()
