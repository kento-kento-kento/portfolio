from django.shortcuts import render

# Create your views here.
def blockpuzzle(request):
    return render(request, 'games/blockpuzzle.html')

def score_view(request):
    return render(request,"games/scores.html")