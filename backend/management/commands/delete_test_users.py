from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction

class Command(BaseCommand):
    help = 'Deletes test users whose email ends with a specific domain (e.g., @test.com)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--domain',
            type=str,
            default='test.com',
            help='The domain of the test user emails to delete (e.g., test.com)'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        domain = options['domain']
        email_suffix = f'@{domain}'

        # Encontra todos os usuários que correspondem ao critério
        # Usamos `__iendswith` para ser case-insensitive
        test_users = User.objects.filter(email__iendswith=email_suffix)

        if not test_users.exists():
            self.stdout.write(self.style.SUCCESS(f"Nenhum usuário de teste encontrado com o domínio '{email_suffix}'."))
            return

        user_count = test_users.count()
        self.stdout.write(f"Encontrados {user_count} usuários de teste com o domínio '{email_suffix}'.")

        # Pede confirmação
        confirm = input(f"Você tem certeza que deseja excluir esses {user_count} usuários? Esta ação é irreversível. (s/n): ")

        if confirm.lower() != 's':
            self.stdout.write(self.style.WARNING("Exclusão cancelada pelo usuário."))
            return

        # O método delete() do QuerySet do Django irá respeitar o on_delete=CASCADE
        deleted_count, deleted_details = test_users.delete()
        self.stdout.write(self.style.SUCCESS(
            f"Sucesso! {deleted_details.get('auth.User', 0)} usuários de teste e seus dados associados foram excluídos."
        ))