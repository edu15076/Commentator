from django import forms
from .models import *
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from .funcs import *


class ProfileForm(UserCreationForm):
    full_name = forms.CharField(max_length=150, required=True, label='Name',
                                widget=forms.TextInput(attrs={'autofocus': 'autofocus'}))

    def __init__(self, *args, **kwargs):
        for field in ProfileForm.base_fields.values():
            field.widget.attrs['placeholder'] = field.label

        super(ProfileForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.add_input(Submit('submit', 'Sign up'))
        self.helper.form_show_labels = False
        self.helper.form_tag = False
        self.helper.disable_csrf = True

    class Meta:
        model = Profile
        fields = ['username', 'email']

        labels = {
            'username': 'Username',
            'email': 'Email',
        }

    field_order = ['full_name', 'username', 'email', 'password1', 'password2']

    def clean_full_name(self):
        full_name = self.cleaned_data['full_name']
        first_name, last_name = split_name(full_name)
        self.instance.first_name = first_name
        self.instance.last_name = last_name
        return full_name


class AuthenticateProfileForm(AuthenticationForm):
    username = forms.CharField(max_length=150, required=True, label='Username')

    def __init__(self, *args, **kwargs):
        for field in AuthenticateProfileForm.base_fields.values():
            field.widget.attrs['placeholder'] = field.label

        super(AuthenticateProfileForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.add_input(Submit('submit', 'Sign in'))
        self.helper.form_show_labels = False
        self.helper.form_tag = False
        self.helper.disable_csrf = True

    class Meta:
        model = Profile


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['comment']
