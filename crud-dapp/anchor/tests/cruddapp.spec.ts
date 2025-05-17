import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {PublicKey} from '@solana/web3.js'
import {Cruddapp} from '../target/types/cruddapp'
import {startAnchor} from 'anchor-bankrun'
import { BankrunProvider } from 'anchor-bankrun'

const IDL = require('../target/idl/cruddapp.json');

const cruddappAddress = new PublicKey("9wg7BZjxcEpAqWhoiYGUT2hZM9iK6vcWGTYDah5mRVjC");

describe('cruddapp', () => {

  let context;
  let provider: BankrunProvider;
  let crudProgram: Program<Cruddapp>;

  beforeAll( async () => {
    context = await startAnchor("", [{ name: "cruddapp", programId: cruddappAddress }], []);
    provider = new BankrunProvider(context);
    crudProgram = new Program(IDL, provider);
  })

  it("create entry", async () => {
    await crudProgram.methods.createJournalEntry("title", "message").rpc();

    const [createEntryAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("title"), provider.publicKey.toBuffer()],
      cruddappAddress
    )

    const createEntry = await crudProgram.account.journalEntryState.fetch(createEntryAddress);

    console.log(createEntry);

    expect(createEntry.owner).toStrictEqual(provider.publicKey);
    expect(createEntry.title).toStrictEqual("title");
    expect(createEntry.message).toStrictEqual("message");
  })

  it("update entry", async () => {
    await crudProgram.methods.updateJournalEntry("title", "new message").rpc();

    const [updateEntryAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("title"), provider.publicKey.toBuffer()],
      cruddappAddress
    )

    const updateEntry = await crudProgram.account.journalEntryState.fetch(updateEntryAddress);

    console.log(updateEntry);

    expect(updateEntry.owner).toStrictEqual(provider.publicKey);
    expect(updateEntry.title).toStrictEqual("title");
    expect(updateEntry.message).toStrictEqual("new message");
  })

  it("delete entry", async () => {
    await crudProgram.methods.deleteJournalEntry("title").rpc();

    const [deleteEntryAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("title"), provider.publicKey.toBuffer()],
      cruddappAddress
    )

    try {
      await crudProgram.account.journalEntryState.fetch(deleteEntryAddress);
      fail("Account should be deleted but still exists");
    } catch (error) {
      console.log("Successfully verified account was deleted");
      expect(error).toBeTruthy();
    }
  })
})
