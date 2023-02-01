from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class Profile(AbstractUser):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=254, unique=True)
    bio = models.TextField(blank=True)
    github = models.URLField(blank=True)
    show_email = models.BooleanField(default=False)
    comments = models.ManyToManyField('Comment')
    
    def __str__(self):
        return self.username


class Comment(models.Model):
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    comment = models.TextField()
    pub_date = models.DateField(auto_now_add=True, null=True)
    
    def __str__(self):
        return self.comment
