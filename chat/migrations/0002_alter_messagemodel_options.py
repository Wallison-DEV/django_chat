# Generated by Django 5.0.3 on 2024-04-02 18:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="messagemodel",
            options={
                "ordering": ("timestamp",),
                "verbose_name": "message",
                "verbose_name_plural": "messages",
            },
        ),
    ]
