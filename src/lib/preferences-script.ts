export const PREFERENCE_SCRIPT = `(function(){
  try {
    var isAdmin = location.pathname.indexOf('/admin') === 0;
    function read(name) {
      var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      if (match) return decodeURIComponent(match[1]);
      try {
        return localStorage.getItem(name) || '';
      } catch (e) {
        return '';
      }
    }
    var theme = isAdmin ? 'dark' : read('aragao-theme');
    if (theme !== 'light' && theme !== 'dark') theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (!isAdmin) {
      var lang = read('aragao-lang');
      if (lang !== 'en' && lang !== 'pt') lang = 'pt';
      document.documentElement.setAttribute('data-locale', lang);
      document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    }
  } catch (e) {}
})();`;
