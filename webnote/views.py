from django.shortcuts import render
from .models import Article

# トップページ
def index(request):
    return render(request, 'webnote/index.html')

# HTMLページ
def html_page(request):
    articles = Article.objects.filter(category='HTML')
    return render(request, 'webnote/html.html', {'articles': articles})

# CSSページ
def css_page(request):
    articles = Article.objects.filter(category='CSS')
    return render(request, 'webnote/css.html', {'articles': articles})

# JSページ
def js_page(request):
    articles = Article.objects.filter(category='JS')
    return render(request, 'webnote/js.html', {'articles': articles})
