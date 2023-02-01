import html
import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator, URLValidator
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.generic.base import View
from django.views.generic.edit import CreateView
from django.http import Http404
from django.db import IntegrityError
from django.db.models import ProtectedError

from .forms import *


# Create your views here.

class NotLoggedUserMixin(UserPassesTestMixin, CreateView):
    def test_func(self):
        return not self.request.user.is_authenticated

    def handle_no_permission(self):
        return HttpResponseRedirect(reverse('home'))


class Signed(View):
    def get(self, request):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if request.user.is_authenticated:
                return JsonResponse({'logged': True, 'name': request.user.get_full_name(), 'username': request.user.get_username()})

            return JsonResponse({'logged': False})

        raise Http404


class ListProfiles(View):
    def get(self, request):
        profiles = Profile.objects.all().exclude(username='admin').values('username', 'first_name',
                                                                          'last_name').order_by('first_name',
                                                                                                'last_name')

        return render(request, 'list_profiles.html', {'profiles': profiles})


class RenderUser(View):
    def get(self, request, profile):
        if profile == 'admin':
            raise Http404

        page_user = get_or_none(Profile, username=profile)

        if page_user is None:
            raise Http404

        edit = False
        if request.user.username == profile:
            edit = True

        comments = page_user.comments.values('user__first_name', 'user__last_name', 'user__username', 'comment',
                                             'pub_date', 'id').order_by('-id')

        return render(request, 'user.html', {'page_user': page_user, 'edit': edit, 'comments': comments, 'edu15076': profile == 'edu15076'})


@login_required(login_url='/sign_in/', redirect_field_name='next')
def post_comment(request, profile):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            data_comment = json.load(request)
        except:
            return JsonResponse({'posted': False})

        comment_raw = data_comment.get('comment', None)

        try:
            profile_comment = Profile.objects.get(username=profile)
        except Profile.DoesNotExist:
            return JsonResponse({'posted': False})

        try:
            comment = Comment.objects.create(user=request.user, comment=html.unescape(comment_raw))
            profile_comment.comments.add(comment)
        except IntegrityError:
            return JsonResponse({'posted': False})

        return JsonResponse({'posted': True, 'id': comment.id})

    raise Http404


@login_required(login_url='/sign_in/', redirect_field_name='next')
def delete_comment(request, pk):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            comment = request.user.comments.get(id=pk)
        except Comment.DoesNotExist:
            comment = Comment.objects.get(id=pk)
            if comment.user != request.user:
                return JsonResponse({'removed': False})

        try:
            comment.delete()
        except ProtectedError:
            return JsonResponse({'removed': False})

        print('got here')

        return JsonResponse({'removed': True})

    raise Http404


@login_required(login_url='/sign_in/', redirect_field_name='next')
def att_bio(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            data = json.load(request)
        except:
            return JsonResponse({'posted': False})

        bio_raw = data.get('bio', None)

        try:
            request.user.bio = html.unescape(bio_raw)
            request.user.save()
        except IntegrityError:
            return JsonResponse({'posted': False})

        return JsonResponse({'posted': True})

    raise Http404


@login_required(login_url='/sign_in/', redirect_field_name='next')
def att_info(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            data = json.load(request)
        except:
            return JsonResponse({'posted': False})

        new_name = data.get('name', None)
        first_name, last_name = split_name(new_name)

        show_email = data.get('show_email', None)

        github = data.get('github', None)

        if github is not None and github != '':
            validate_github_url = URLValidator()

            try:
                validate_github_url(github)
            except ValidationError:
                return JsonResponse({'posted': False})

        try:
            request.user.first_name = first_name
            request.user.last_name = last_name
            request.user.github = github
            request.user.show_email = show_email

            request.user.save()
        except IntegrityError:
            return JsonResponse({'posted': False})

        return JsonResponse({'posted': True, 'email': request.user.email})

    raise Http404


@login_required(login_url='/sign_in/', redirect_field_name='next')
def validate_github(request):
    if request.method == 'GET' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        some_url = request.GET.get('url', None)

        if some_url is None or some_url.find('github.com') == -1:
            return JsonResponse({'valid': 'Not a GitHub url.', 'url': ''})

        validate_some_url = URLValidator()

        try:
            validate_some_url(some_url)
        except ValidationError:
            try:
                some_url = 'https://' + some_url
                validate_some_url(some_url)
            except ValidationError:
                return JsonResponse({'valid': 'Invalid url', 'url': ''})

        return JsonResponse({'valid': '', 'url': some_url})

    raise Http404

class SignUp(NotLoggedUserMixin, View):

    def get(self, request, fail='None'):
        fail_bool = False
        if fail == 'error':
            fail_bool = True

        return render(request, 'sign_up.html', {'sign_up_form': ProfileForm(), 'fail': fail_bool})

    def post(self, request, fail='None'):
        if request.method == 'POST':
            form = ProfileForm(request.POST)
            nxt = request.GET.get('next', '/')

            if form.is_valid():
                form.save()
                login(request, form.instance)

                return HttpResponseRedirect(nxt)
            else:
                return HttpResponseRedirect(reverse('sign_up_err', kwargs={'fail': 'error'}) + '?next=' + nxt)


class SignIn(NotLoggedUserMixin, View):
    def get(self, request, fail='None'):
        fail_bool = False
        if fail == 'error':
            fail_bool = True

        return render(request, 'sign_in.html', {'sign_in_form': AuthenticateProfileForm(), 'fail': fail_bool})

    def post(self, request, fail='None'):
        if request.method == 'POST':
            form = AuthenticateProfileForm(data=request.POST)
            nxt = request.GET.get('next', '/')

            if form.is_valid():
                username = form.cleaned_data['username']
                password = form.cleaned_data['password']

                user = authenticate(username=username, password=password)
                if user is not None:
                    login(request, user)
                else:
                    return HttpResponseRedirect(reverse('sign_in_err', kwargs={'fail': 'error'}) + '?next=' + nxt)

                return HttpResponseRedirect(nxt)
            else:
                return HttpResponseRedirect(reverse('sign_in_err', kwargs={'fail': 'error'}) + '?next=' + nxt)


class SignOut(LoginRequiredMixin, View):
    login_url = '/sign_in/'

    def get(self, request, username):        
        nxt = request.GET.get('next', None)
        if nxt is None:
            raise Http404
        
        if request.user.username == username:
            logout(request)

        return HttpResponseRedirect(nxt)


class DeleteAccount(LoginRequiredMixin, View):
    login_url = '/sign_in/'
    redirect_field_name = 'next'

    def get(self, request, username):
        nxt = request.GET.get('next', None)
        if nxt is None:
            raise Http404

        if username == request.user.username:
            logout(request)
            Profile.objects.filter(username=username).delete()

        return HttpResponseRedirect(reverse('home'))


def validate_username_get(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        username = request.GET.get('username', None)

        return JsonResponse({'username_in_use': Profile.objects.filter(username__iexact=username).exists()})

    raise Http404


def validate_email_get(request):
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        email = request.GET.get('email', None)

        validate_email = EmailValidator()
        errors = False

        try:
            validate_email(email)
        except ValidationError:
            errors = True

        return JsonResponse({
            'email_in_use': Profile.objects.filter(email__iexact=email).exists(),
            'email_not_valid': errors
        })

    raise Http404


def validate_password_post(request):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':

        password = request.POST.get('password1', None)
        email = request.POST.get('email', None)
        username = request.POST.get('username', None)
        name = request.POST.get('name', None)

        first_name, last_name = split_name(name)

        errors = []
        try:
            validate_password(password,
                              user=Profile(first_name=first_name, last_name=last_name, email=email, username=username,
                                           password=password))
        except ValidationError as error:
            for err in error:
                errors.append(err)

        return JsonResponse({'invalid_password': errors})
    
    raise Http404
