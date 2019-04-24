plugin_name = 'Yahoo'


class Yahoo:
    def __init__(self):
        self.name = 'Yahoo tests'
        self.tests = {
            'Search': self.search,
            'Login': self.login
        }

    def start(self):
        pass

    def stop(self):
        pass

    def search(self, idx):
        pass

    def login(self, idx):
        pass
