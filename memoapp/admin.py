from django.contrib import admin
from .models import Memo

@admin.register(Memo)
class MemoAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "created_at")
    list_filter = ("user",)
    search_fields = ("title", "content")
    ordering = ("-created_at",)
    
    # 管理者は内容を編集できない（任意）
    readonly_fields = ("user", "title", "content", "created_at", "updated_at")