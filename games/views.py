from django.shortcuts import render

# Create your views here.
def blockpuzzle(request):
    return render(request, 'games/blockpuzzle.html')