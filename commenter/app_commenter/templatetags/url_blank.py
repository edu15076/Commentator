from django import template

register = template.Library()

@register.filter(is_safe=True)
def url_blank(format_string):
    return format_string.replace('<a', '<a class="link-like" target="_blank" rel="noopener noreferrer" ')
