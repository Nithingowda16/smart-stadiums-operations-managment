from typing import Dict

# Dictionary mapping common phrases/categories to target languages.
TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "English": {
        "welcome": "Welcome to FIFA ONE AI. Your digital pass is active.",
        "emergency_alert": "Emergency: Fire detected in East Sector. Please evacuate immediately through Gate D.",
        "gate_redirect": "Crowd alert: Gate A is full. Please proceed to Gate B.",
        "arrived": "You have arrived at your destination.",
        "medical_dispatch": "Medical team dispatched to your location.",
        "match_started": "The match has started! Enjoy the game.",
        "parking_full": "Parking Lot A is full. Redirecting to Parking Lot C."
    },
    "Spanish": {
        "welcome": "Bienvenido a FIFA ONE AI. Su pase digital está activo.",
        "emergency_alert": "Emergencia: Incendio detectado en el Sector Este. Evacue inmediatamente por la Puerta D.",
        "gate_redirect": "Alerta de multitud: La Puerta A está llena. Por favor proceda a la Puerta B.",
        "arrived": "Ha llegado a su destino.",
        "medical_dispatch": "Equipo médico enviado a su ubicación.",
        "match_started": "¡El partido ha comenzado! Disfrute del juego.",
        "parking_full": "El estacionamiento A está lleno. Redirigiendo al estacionamiento C."
    },
    "French": {
        "welcome": "Bienvenue sur FIFA ONE AI. Votre pass numérique est activé.",
        "emergency_alert": "Urgence: Incendie détecté dans le secteur Est. Veuillez évacuer immédiatement par la porte D.",
        "gate_redirect": "Alerte foule: La porte A est pleine. Veuillez vous diriger vers la porte B.",
        "arrived": "Vous êtes arrivé à destination.",
        "medical_dispatch": "Équipe médicale envoyée à votre emplacement.",
        "match_started": "Le match a commencé! Bon match.",
        "parking_full": "Le parking A est complet. Redirection vers le parking C."
    },
    "Arabic": {
        "welcome": "مرحبًا بك في FIFA ONE AI. تذكرتك الرقمية نشطة.",
        "emergency_alert": "حالة طوارئ: تم اكتشاف حريق في القطاع الشرقي. يرجى الإخلاء فوراً عبر البوابة D.",
        "gate_redirect": "تنبيه الازدحام: البوابة A ممتلئة. يرجى التوجه إلى البوابة B.",
        "arrived": "لقد وصلت إلى وجهتك.",
        "medical_dispatch": "تم إرسال الفريق الطبي إلى موقعك.",
        "match_started": "بدأت المباراة! استمتع باللعب.",
        "parking_full": "مواقف السيارات A ممتلئة. إعادة التوجيه إلى مواقف السيارات C."
    },
    "Hindi": {
        "welcome": "FIFA ONE AI में आपका स्वागत है। आपका डिजिटल पास सक्रिय है।",
        "emergency_alert": "आपातकाल: पूर्वी सेक्टर में आग का पता चला है। कृपया तुरंत गेट D से बाहर निकलें।",
        "gate_redirect": "भीड़ अलर्ट: गेट A भरा हुआ है। कृपया गेट B की ओर बढ़ें।",
        "arrived": "आप अपने गंतव्य पर पहुंच गए हैं।",
        "medical_dispatch": "चिकित्सा टीम को आपके स्थान पर भेज दिया गया है।",
        "match_started": "मैच शुरू हो गया है! खेल का आनंद लें।",
        "parking_full": "पार्किंग स्थल A भरा हुआ है। पार्किंग स्थल C की ओर निर्देशित किया जा रहा है।"
    },
    "Portuguese": {
        "welcome": "Bem-vindo ao FIFA ONE AI. Seu passe digital está ativo.",
        "emergency_alert": "Emergência: Incêndio detectado no Setor Leste. Por favor, evacue imediatamente pelo Portão D.",
        "gate_redirect": "Alerta de multidão: O Portão A está cheio. Por favor, prossiga para o Portão B.",
        "arrived": "Você chegou ao seu destino.",
        "medical_dispatch": "Equipe médica enviada para sua localização.",
        "match_started": "A partida começou! Aproveite o jogo.",
        "parking_full": "O estacionamento A está cheio. Redirecionando para o estacionamento C."
    },
    "German": {
        "welcome": "Willkommen bei FIFA ONE AI. Ihr digitaler Pass ist aktiv.",
        "emergency_alert": "Notfall: Feuer im Ostsektor entdeckt. Bitte evakuieren Sie sofort über Tor D.",
        "gate_redirect": "Zuschauerwarnung: Tor A ist überfüllt. Bitte gehen Sie zu Tor B.",
        "arrived": "Sie sind an Ihrem Ziel angekommen.",
        "medical_dispatch": "Medizinisches Team zu Ihrem Standort entsandt.",
        "match_started": "Das Spiel hat begonnen! Genießen Sie das Spiel.",
        "parking_full": "Parkplatz A ist besetzt. Umleitung zu Parkplatz C."
    },
    "Italian": {
        "welcome": "Benvenuto in FIFA ONE AI. Il tuo pass digitale è attivo.",
        "emergency_alert": "Emergenza: Incendio rilevato nel settore est. Evacuare immediatamente attraverso il Gate D.",
        "gate_redirect": "Allerta folla: Il Gate A è pieno. Si prega di procedere al Gate B.",
        "arrived": "Sei arrivato a destinazione.",
        "medical_dispatch": "Team medico inviato alla tua posizione.",
        "match_started": "La partita è iniziata! Buon divertimento.",
        "parking_full": "Il parcheggio A è pieno. Reindirizzamento al parcheggio C."
    },
    "Japanese": {
        "welcome": "FIFA ONE AI へようこそ。デジタルパスが有効です。",
        "emergency_alert": "緊急事態：東セクターで火災を検出。ゲートDから直ちに避難してください。",
        "gate_redirect": "混雑警告：ゲートAは満員です。ゲートBへ進んでください。",
        "arrived": "目的地に到着しました。",
        "medical_dispatch": "医療チームが現在地に向かっています。",
        "match_started": "試合が始まりました！観戦をお楽しみください。",
        "parking_full": "駐車場Aは満車です。駐車場Cへ迂回してください。"
    },
    "Korean": {
        "welcome": "FIFA ONE AI에 오신 것을 환영합니다. 디지털 패스가 활성화되었습니다.",
        "emergency_alert": "응급상황: 동쪽 구역에 화재 감지. 즉시 D 게이트로 대피해 주십시오.",
        "gate_redirect": "군중 경고: A 게이트가 만석입니다. B 게이트로 진행해 주십시오.",
        "arrived": "목적지에 도착했습니다.",
        "medical_dispatch": "의료팀이 귀하의 위치로 출동했습니다.",
        "match_started": "경기가 시작되었습니다! 경기를 즐기세요.",
        "parking_full": "주차장 A가 만차입니다. 주차장 C로 우회합니다."
    },
    "Chinese": {
        "welcome": "欢迎使用 FIFA ONE AI。您的数字通行证已激活。",
        "emergency_alert": "紧急情况：东区检测到火灾。请立即从 D 门撤离。",
        "gate_redirect": "人群警报：A 门已满。请前往 B 门。",
        "arrived": "您已到达目的地。",
        "medical_dispatch": "医疗队已派往您的位置。",
        "match_started": "比赛已经开始！祝您观赛愉快。",
        "parking_full": "停车场 A 已满。正在重定向到停车场 C。"
    }
}

def translate_phrase(phrase_key: str, target_lang: str) -> str:
    """
    Translates a system string key into one of the 11 supported languages.
    Fallback to English if key or language does not exist.
    """
    lang_dict = TRANSLATIONS.get(target_lang, TRANSLATIONS["English"])
    return lang_dict.get(phrase_key, TRANSLATIONS["English"].get(phrase_key, phrase_key))

def translate_freeform(text: str, target_lang: str) -> str:
    """
    Simulates real-time freeform translation by mapping matching tokens or returning translated tags.
    """
    # Simple search replacement to make mock responses look translated
    if target_lang == "English":
        return text
        
    lang_dict = TRANSLATIONS.get(target_lang, TRANSLATIONS["English"])
    translated = text
    
    # Heuristics: Replace known terms
    replacements = {
        "emergency": "emergency_alert",
        "gate a": "gate_redirect",
        "arrived": "arrived",
        "medical": "medical_dispatch",
        "parking": "parking_full",
        "welcome": "welcome"
    }
    
    for en_word, key in replacements.items():
        if en_word in text.lower():
            return lang_dict[key] + f" (Translated to {target_lang})"
            
    return f"[{target_lang}] " + text
