# Generated migration to add database indexes for performance optimization

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0019_userprofile_study_plan'),
    ]

    operations = [
        # Indexes para Gamification (usado em rankings e hero stats)
        migrations.AddIndex(
            model_name='gamification',
            index=models.Index(fields=['-xp'], name='api_gamific_xp_idx'),
        ),
        migrations.AddIndex(
            model_name='gamification',
            index=models.Index(fields=['level'], name='api_gamific_level_idx'),
        ),
        
        # Indexes para ActivityLog (usado em rankings semanais e online users)
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['user', '-date'], name='api_activitylog_user_date_idx'),
        ),
        migrations.AddIndex(
            model_name='activitylog',
            index=models.Index(fields=['-date'], name='api_activitylog_date_idx'),
        ),
        
        # Indexes para UserPerformance (usado em rankings por matéria)
        migrations.AddIndex(
            model_name='userperformance',
            index=models.Index(fields=['subject', '-correct_answers'], name='api_userperf_subj_corr_idx'),
        ),
        
        # Indexes para UserQuest (usado em daily quests)
        migrations.AddIndex(
            model_name='userquest',
            index=models.Index(fields=['user', 'quest_date'], name='api_userquest_user_date_idx'),
        ),
    ]
