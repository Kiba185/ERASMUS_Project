using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;

var builder = WebApplication.CreateBuilder(args);

// === TADY ZAČÍNÁ KÓD PRO FIREBASE ===
// Ujisti se, že se soubor jmenuje přesně tak, jak jsi ho pojmenoval ve Visual Studiu
string firebaseKeyPath = "firebase-key.json";

FirebaseApp.Create(new AppOptions()
{
    Credential = GoogleCredential.FromFile(firebaseKeyPath)
});
// === TADY KONČÍ KÓD PRO FIREBASE  

// Následuje tvůj původní kód, který tam už byl:
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapibuilder
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();