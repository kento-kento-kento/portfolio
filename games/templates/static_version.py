from django import template
from django.templatetags.static import static
import os
from django.conf import settings
import time

register = template.Library();

@register.simple_tag
def static_version(path):
    file_path = os.path.join(settings.STATIC_ROOT,path)
    if os.path.exists(file_path):
        version = int(os.path.getmtime(file_path))
    else:
        version = int(time.time())
    return f"{static(path)}?v={version}"