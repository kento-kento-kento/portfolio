from django.shortcuts import render

# AI用
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .services.ai.blockpuzzle_analyzer import analyze_blockpuzzle

# Create your views here.
def blockpuzzle(request):
    return render(request, 'games/blockpuzzle.html')

def score_view(request):
    return render(request,"games/scores.html")

def billiard(request):
    return render(request,'games/billiard.html')

@csrf_exempt
def analyze_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        summary = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    result = analyze_blockpuzzle(summary)
    return JsonResponse({"analysis": result})