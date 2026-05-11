from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0007_seed_configsettings_5pct'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Review',
        ),
    ]
