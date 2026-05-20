using Microsoft.AspNetCore.Mvc;
using FirebaseAdmin.Auth;
using System.Linq;// Pro správu uživatelů
// using Google.Cloud.Firestore; // Pro databázi (pokud doinstaluješ balíček)

namespace ErasmusProject.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UzivatelController : ControllerBase
{
    [HttpGet("test-auth")]
    public async Task<IActionResult> TestFirebase()
    {
        try
        {
            // Příklad: Získání seznamu uživatelů z Firebase Authentication
            // V reálném kódu bys spíše ověřoval token, který ti pošle frontend
            var page = await FirebaseAuth.DefaultInstance.ListUsersAsync(new ListUsersOptions { PageSize = 10 }).AsRawResponses().FirstAsync();

            return Ok(new { zprava = "Propojení s Firebase funguje!", pocetUzivatelu = page.Users.Count() });
        }
        catch (Exception ex)
        {
            return BadRequest($"Chyba Firebase: {ex.Message}");
        }
    }
}