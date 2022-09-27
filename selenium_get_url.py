from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait

class Judge:
    def __call__(self, driver):
        node = driver.find_element_by_xpath('//*[@id="viewFrame"]')
        if 'm3u8' in node.get_attribute('src'):
            return node.get_attribute('src')
        else:
            return False

class InitDriver:
    def __init__(self, driver_path, course_url):
        self.driver = webdriver.Safari(driver_path)
        self.driver.get(course_url)

    def get_url(self):
        try:
            element = WebDriverWait(self.driver, 30).until(Judge())
            self.driver.quit()
            return element
        except:
            self.driver.quit()
            return False