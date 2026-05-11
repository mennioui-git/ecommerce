from django.db import migrations


def create_default_config(apps, schema_editor):
    ConfigSettings = apps.get_model("store", "ConfigSettings")
    if not ConfigSettings.objects.exists():
        ConfigSettings.objects.create(
            service_fee_charge_type="percentage",
            service_fee_percentage=5,
        )


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0006_add_reviewer_name_to_review"),
    ]

    operations = [
        migrations.RunPython(create_default_config, migrations.RunPython.noop),
    ]
