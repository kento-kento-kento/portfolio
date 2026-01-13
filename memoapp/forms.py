from django import forms
from .models import Memo
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class MemoForm(forms.ModelForm):
    class Meta:
        model = Memo
        fields = ['title', 'content']
        widgets = {
            'title': forms.TextInput(attrs={
                'placeholder': 'タイトル',
                'required': True,
            }),
            'content': forms.Textarea(attrs={
                'placeholder': 'メモ内容',
                'required': False,  
            }),
        }


# 2. ユーザー登録用フォーム（日本語化）
class CustomUserCreationForm(UserCreationForm):
    username = forms.CharField(label='ユーザー名', max_length=150)
    password1 = forms.CharField(
        label='パスワード',
        widget=forms.PasswordInput,
        help_text=(
            "安全なパスワードを設定してください:\n"
            "・8文字以上\n"
            "・英字（大文字・小文字） + 数字 + 記号 を含む\n"
            "・個人情報と似ていない\n"
            "・よく使われるパスワードは避ける\n"
            "・数字だけは不可"
        )
    )
    password2 = forms.CharField(
        label='パスワード確認',
        widget=forms.PasswordInput,
        help_text='確認のため同じパスワードをもう一度入力してください'
    )

    class Meta:
        model = User
        fields = ('username', 'password1', 'password2')
        
    def clean_password1(self):
        password = self.cleaned_data.get('password1')
        if not re.search(r'[A-Z]', password):
            raise ValidationError("パスワードに少なくとも1つの大文字が必要です")
        if not re.search(r'[a-z]', password):
            raise ValidationError("パスワードに少なくとも1つの小文字が必要です")
        if not re.search(r'\d', password):
            raise ValidationError("パスワードに少なくとも1つの数字が必要です")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError("パスワードに少なくとも1つの記号が必要です")
        return password