"""
Script para adicionar fotos de perfil aos usuários
"""
import os
import django
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from django.core.files.base import ContentFile

def generate_avatar(name, size=200):
    """Gera um avatar colorido com as iniciais do nome"""
    # Cores bonitas para o background
    colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ]
    
    # Pega as iniciais
    initials = ''.join([word[0].upper() for word in name.split()[:2]]) if name else '?'
    
    # Cria a imagem
    img = Image.new('RGB', (size, size), random.choice(colors))
    draw = ImageDraw.Draw(img)
    
    # Tenta usar uma fonte, se não conseguir usa a padrão
    try:
        font = ImageFont.truetype("arial.ttf", size // 3)
    except:
        font = ImageFont.load_default()
    
    # Calcula posição do texto para centralizar
    bbox = draw.textbbox((0, 0), initials, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    position = ((size - text_width) // 2, (size - text_height) // 2 - 10)
    
    # Desenha o texto
    draw.text(position, initials, fill='white', font=font)
    
    # Salva em bytes
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return buffer

def add_avatars_to_users():
    """Adiciona avatares aos usuários que não têm"""
    from api.models import UserProfile
    
    users = User.objects.all()
    
    print(f"Processando {users.count()} usuários...")
    
    for user in users:
        try:
            # Cria perfil se não existir
            profile, created = UserProfile.objects.get_or_create(user=user)
            if created:
                print(f"📝 Perfil criado para {user.username}")
            
            # Verifica se já tem foto
            if profile.foto:
                print(f"⏭️  {user.username} já tem foto")
                continue
            
            # Gera avatar
            name = user.first_name if user.first_name else user.username.split('@')[0]
            avatar_buffer = generate_avatar(name)
            
            # Como foto é BinaryField, salvamos os bytes diretamente
            profile.foto = avatar_buffer.getvalue()
            profile.save()
            
            print(f"✅ Avatar criado para {user.username} ({name})")
            
        except Exception as e:
            import traceback
            print(f"❌ Erro ao criar avatar para {user.username}: {e}")
            traceback.print_exc()
    
    print("\n✨ Processo concluído!")

if __name__ == '__main__':
    add_avatars_to_users()
