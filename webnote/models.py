from django.db import models

# Create your models here.

class Article(models.Model):
    CATEGORY_CHOICES = [('HTML', 'HTML'), ('CSS', 'CSS'), ('JS', 'JavaScript')]
    title = models.CharField(max_length=100)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    content = models.TextField()
    sample_html = models.TextField(blank=True)
    sample_css = models.TextField(blank=True)
    sample_js = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

   