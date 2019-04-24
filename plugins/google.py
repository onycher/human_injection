from selenium.webdriver import Firefox
from selenium.webdriver.common.keys import Keys

plugin_name = 'Google'


class Google:
    def __init__(self):
        self.driver = None
        self.name = 'Google test suite'
        self.tests = {'Search': self.search}

    def start(self):
        self.driver = Firefox()

    def stop(self):
        self.driver.quit()

    def search(self, text):
        self.driver.get('https://google.com')
        self.driver.find_element_by_name('q').send_keys(text)
        self.driver.find_element_by_name('q').send_keys(Keys.ENTER)
