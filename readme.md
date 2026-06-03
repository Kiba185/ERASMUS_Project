# 🎓 ERASMUS Project — Engineers School System

Full-stack webová aplikace pro správu školy (studenti, učitelé, rodiče, admini).

- **Frontend:** React + TypeScript + Vite + TailwindCSS  
- **Backend:** Node.js + Express + TypeScript + Prisma  
- **Databáze:** PostgreSQL  
- **Deploy:** [Render](https://render.com)

---

## 🚀 Lokální spuštění (pro každého v týmu)

### 1. Klonování repozitáře

```bash
git clone https://github.com/Kiba185/ERASMUS_Project.git
cd ERASMUS_Project
```

### 2. Nastavení backendu

```bash
cd backend
npm install
```

Vytvoř soubor `.env` (zkopíruj z `.env.example`):

```bash
cp .env.example .env
```

> **Nejjednodušší varianta:** Do `.env` vlož connection string ke sdílené Render databázi — zeptej se vedoucího týmu.

Vygeneruj Prisma klienta a spusť migrace:

```bash
npx prisma generate
npx prisma migrate deploy
```

Spusť backend:

```bash
npm run dev
```

Backend poběží na `http://localhost:3000`

---

### 3. Nastavení frontendu

```bash
cd frontend
npm install
```

Vytvoř soubor `.env.local`:

```bash
cp .env.example .env.local
```

Obsah `.env.local` (nechej tak jak je):
```
VITE_API_URL=http://localhost:3000
```

Spusť frontend:

```bash
npm run dev
```

Frontend poběží na `http://localhost:5173`

---

## 🌿 Práce v týmu — Git workflow

### Pravidla

- ✅ **Nikdy nepush přímo do `main`**
- ✅ Každý pracuje na **vlastní větvi**
- ✅ Změny se mergují přes **Pull Request**

### Postup pro každého člena

```bash
# 1. Stáhni nejnovější main
git checkout main
git pull origin main

# 2. Vytvoř vlastní větev (pojmenuj ji podle funkce nebo svého jména)
git checkout -b feature/nazev-funkce
# nebo
git checkout -b jan/oprava-loginu

# 3. Pracuj a commituj průběžně
git add .
git commit -m "popis změny"

# 4. Pushni větev na GitHub
git push origin feature/nazev-funkce

# 5. Na GitHubu vytvoř Pull Request do main
# Ostatní zkontrolují kód a schválí merge
```

### Jak aktualizovat svou větev z main

```bash
git checkout main
git pull origin main
git checkout tvoje-vetev
git merge main
```

---

## 🌐 Produkce (Render)

| Služba | URL |
|--------|-----|
| Frontend | https://engineers-dz0o.onrender.com |
| Backend | https://engineers-backend-7kv2.onrender.com |

Deploy se spustí automaticky při každém push do `main`.

> ⚠️ Push do `main` = automatický deploy na produkci. Testuj vždy lokálně nejdřív!