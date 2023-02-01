def split_name(name):
    if name is not None:
        name = name.split(' ')
        first_name = name[0]
        last_name = ' '.join(name[1:])
        return first_name, last_name
    
    return '', ''


def get_or_none(model, *args, **kwargs):
    try:
        return model.objects.get(*args, **kwargs)
    except model.DoesNotExist:
        return None
