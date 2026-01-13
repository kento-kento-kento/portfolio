from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login as auth_login
from .models import Memo
from .forms import MemoForm ,CustomUserCreationForm 
from django.shortcuts import get_object_or_404

@login_required(login_url='memoapp:login')
def memo_home(request):
    """
    メモ一覧画面（閲覧専用）
    """
    memos = Memo.objects.filter(user=request.user).order_by('-updated_at')
    return render(request, 'memoapp/memo_home.html', {'memos': memos})
    
    
def signup(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login")
    else:
        form = CustomUserCreationForm()
    return render(request, "registration/signup.html", {"form": form})



@login_required(login_url='memoapp:login')
def add_memo(request):
    """
    新規作成 ＋ 編集 共通
    """
    memo_id = request.GET.get('id')

    if memo_id:
        memo = get_object_or_404(Memo, id=memo_id, user=request.user)
    else:
        memo = None

    if request.method == "POST":
        form = MemoForm(request.POST, instance=memo)
        if form.is_valid():
            saved = form.save(commit=False)
            saved.user = request.user
            saved.save()
            return redirect('memoapp:memo_home')
    else:
        form = MemoForm(instance=memo)

    return render(request, "memoapp/add_memo.html", {
        "form": form,
        "memo": memo,
    })


@login_required(login_url='memoapp:login')
def delete_memo(request, pk):
    """
    削除専用（確認画面なし）
    """
    memo = get_object_or_404(Memo, pk=pk, user=request.user)
    memo.delete()
    return redirect('memoapp:memo_home')